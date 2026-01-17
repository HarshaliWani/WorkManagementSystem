from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import GR
from .serializers import GRSerializer

class GRViewSet(viewsets.ModelViewSet):
    queryset = GR.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = GRSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only non-demo GRs"""
        return GR.objects.filter(is_demo=False).order_by('-date')
    
    def create(self, request, *args, **kwargs):
        """Handle GR creation with file upload"""
        print("📤 CREATE REQUEST DATA:", request.data)  # Debug
        print("📎 FILES:", request.FILES)  # Debug
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Handle GR update with file upload"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
