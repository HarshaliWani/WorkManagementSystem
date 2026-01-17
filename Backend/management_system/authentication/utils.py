"""
Utility functions for user approval tokens
"""
from urllib.parse import urlencode
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.conf import settings


def generate_approval_token(user_id):
    """
    Generate a secure, time-limited token for user approval.
    
    Args:
        user_id: The ID of the user to approve
        
    Returns:
        A signed token string that can be used in approval URLs
    """
    signer = TimestampSigner()
    # Sign the user ID with a 7-day expiry
    token = signer.sign(str(user_id))
    return token


def verify_approval_token(token):
    """
    Verify and decode an approval token.
    
    Args:
        token: The signed token string from the approval URL
        
    Returns:
        tuple: (user_id, error_message)
        - If valid: (user_id as int, None)
        - If expired: (None, "Token has expired")
        - If invalid: (None, "Invalid token")
    """
    signer = TimestampSigner()
    
    try:
        # Verify and unsign the token (checks expiry automatically)
        user_id_str = signer.unsign(token, max_age=7 * 24 * 60 * 60)  # 7 days in seconds
        user_id = int(user_id_str)
        return user_id, None
    except SignatureExpired:
        return None, "Token has expired. Please request a new approval link."
    except BadSignature:
        return None, "Invalid token. The approval link is not valid."
    except (ValueError, TypeError):
        return None, "Invalid token format."


def get_approval_url(user_id, request=None):
    """
    Generate the full approval URL for a user.
    
    Args:
        user_id: The ID of the user to approve
        request: Optional HttpRequest object to get the domain
        
    Returns:
        Full approval URL string
    """
    token = generate_approval_token(user_id)
    
    # Get the base URL
    if request:
        base_url = request.build_absolute_uri('/')
    else:
        # Fallback to settings or default
        base_url = getattr(settings, 'BACKEND_DOMAIN', 'http://localhost:8000')
        if not base_url.endswith('/'):
            base_url += '/'
    
    # Construct the approval URL with properly encoded token
    approval_path = 'api/admin/approve-user/'
    base_url_clean = base_url.rstrip('/')
    approval_url = f"{base_url_clean}/{approval_path}?{urlencode({'token': token})}"
    
    return approval_url

