import logging
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer
)
from .utils import get_approval_url, verify_approval_token

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Register a new user and return JWT tokens
    Sends email notification to admin with approval link
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send email notification to admin
        self._send_approval_email(user, request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    
    def _send_approval_email(self, user, request):
        """
        Send email to admin with user details and approval link.
        If email fails, log the error but don't fail registration.
        """
        try:
            # Get admin email from settings or use default
            admin_email = getattr(settings, 'ADMIN_APPROVAL_EMAIL', None)
            if not admin_email:
                # Fallback to DEFAULT_FROM_EMAIL or ADMINS setting
                admin_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
                if not admin_email and hasattr(settings, 'ADMINS') and settings.ADMINS:
                    admin_email = settings.ADMINS[0][1]  # Get email from first admin tuple
            
            if not admin_email:
                logger.warning('No admin email configured. Skipping approval email notification.')
                return
            
            # Generate approval URL
            approval_url = get_approval_url(user.id, request)
            
            # Prepare email content
            subject = f'New User Registration: {user.email}'
            message = f"""
A new user has registered and requires approval:

User ID: {user.id}
Email: {user.email}
Username: {user.username}
Name: {user.first_name} {user.last_name}
Date Joined: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}

To approve this user, click the following link:
{approval_url}

Or manually approve in Django admin:
http://{request.get_host()}/admin/authentication/user/{user.id}/change/

This approval link will expire in 7 days.
"""
            
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')
            
            # Send email
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[admin_email],
                fail_silently=False,
            )
            
            logger.info(f'Approval email sent to {admin_email} for user {user.id} ({user.email})')
            
        except Exception as e:
            # Log error but don't fail registration
            logger.error(f'Failed to send approval email for user {user.id}: {str(e)}', exc_info=True)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login user and return JWT tokens
    Accepts email and password, uses custom serializer to include user details
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(generics.GenericAPIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token to logout user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response(
                    {'error': 'refresh_token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except TokenError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserDetailView(generics.RetrieveAPIView):
    """
    GET /api/auth/user/
    Return current authenticated user details
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ApproveUserView(APIView):
    """
    GET /api/admin/approve-user/?token=<token>
    Approve a user via secure token link sent in email
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        token = request.query_params.get('token')
        
        if not token:
            return JsonResponse({
                'error': 'Token parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token and get user ID
        user_id, error_message = verify_approval_token(token)
        
        if error_message:
            return JsonResponse({
                'error': error_message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already approved
        if user.is_approved:
            return JsonResponse({
                'message': 'User is already approved',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                }
            }, status=status.HTTP_200_OK)
        
        # Approve the user
        user.is_approved = True
        user.save()
        
        logger.info(f'User {user.id} ({user.email}) approved via token link')
        
        # Return success response (can be JSON or simple HTML)
        accept_header = request.META.get('HTTP_ACCEPT', '')
        if 'text/html' in accept_header:
            # Return simple HTML page
            html_response = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>User Approved</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                    }}
                    .container {{
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                    }}
                    .success {{
                        color: #28a745;
                        font-size: 1.5rem;
                        margin-bottom: 1rem;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✓ User Approved Successfully</div>
                    <p>User <strong>{user.email}</strong> has been approved and can now access the system.</p>
                </div>
            </body>
            </html>
            """
            from django.http import HttpResponse
            return HttpResponse(html_response, content_type='text/html')
        else:
            # Return JSON response
            return JsonResponse({
                'message': 'User approved successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username
                }
            }, status=status.HTTP_200_OK)
