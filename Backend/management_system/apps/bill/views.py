from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Bill
from .serializers import BillSerializer

class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new bill for a tender"""
        tender_id = request.data.get('tender_id')
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            bill = serializer.save(tender_id=tender_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )