# apps/works/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from decimal import Decimal
from .models import Work, Spill
from .serializers import WorkSerializer, SpillSerializer


class WorkViewSet(viewsets.ModelViewSet):
    """ViewSet for Work CRUD operations"""
    queryset = Work.objects.all()
    serializer_class = WorkSerializer

    def get_queryset(self):
        """
        FIX: Filter works by GR if 'gr' query parameter is provided
        """
        queryset = Work.objects.all().select_related('gr').prefetch_related('spills')
        
        # Get the 'gr' parameter from query string (?gr=1)
        gr_id = self.request.query_params.get('gr', None)
        
        if gr_id is not None:
            # Filter works by the specified GR ID
            queryset = queryset.filter(gr_id=gr_id)
        
        return queryset.order_by('-created_at')


class SpillViewSet(viewsets.ModelViewSet):
    queryset = Spill.objects.all()
    serializer_class = SpillSerializer

    def get_queryset(self):
        """
        ✅ Filter spills by work if 'work' query parameter is provided
        """
        queryset = Spill.objects.all().select_related('work')
        
        # Get the 'work' parameter from query string (?work=1)
        work_id = self.request.query_params.get('work', None)
        
        if work_id is not None:
            # Filter spills by the specified Work ID
            queryset = queryset.filter(work_id=work_id)
        
        return queryset.order_by('-created_at')
   
