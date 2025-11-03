from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Tender
from .serializers import TenderSerializer

class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.all()
    serializer_class = TenderSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new tender for a technical sanction"""
        ts_id = request.data.get('technical_sanction_id')
        
        try:
            # Validate and create
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            tender = serializer.save(technical_sanction_id=ts_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )