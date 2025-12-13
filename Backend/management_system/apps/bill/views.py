# apps/bill/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Bill
from .serializers import BillSerializer


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new bill"""
        # Check if tender_id is provided
        if 'tender' not in request.data and 'tender_id' not in request.data:
            return Response(
                {'error': 'tender or tender_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If tender_id is provided, rename it to tender for the serializer
        if 'tender_id' in request.data and 'tender' not in request.data:
            request.data['tender'] = request.data['tender_id']
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
