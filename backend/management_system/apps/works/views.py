# apps/works/views.py
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from .models import Work, Spill
from .serializers import WorkSerializer, SpillSerializer


class WorkViewSet(viewsets.ModelViewSet):
    """ViewSet for Work CRUD operations"""
    queryset = Work.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = WorkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return only non-demo works, ensuring related GRs are not demo
        Supports filtering by: gr (multiple filters work together)
        """
        queryset = Work.objects.filter(
            is_demo=False,
            gr__is_demo=False  # Also exclude works linked to demo GRs
        ).select_related('gr').prefetch_related('spills')
        
        # Get the 'gr' parameter from query string (?gr=1)
        gr_id = self.request.query_params.get('gr', None)
        
        if gr_id is not None:
            # Filter works by the specified GR ID (and ensure GR is not demo)
            queryset = queryset.filter(gr_id=gr_id, gr__is_demo=False, is_demo=False)
        
        return queryset.order_by('-created_at')


class SpillViewSet(viewsets.ModelViewSet):
    queryset = Spill.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = SpillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter spills by work if 'work' query parameter is provided
        Always exclude demo data and ensure related Works are not demo
        """
        queryset = Spill.objects.filter(
            is_demo=False,
            work__is_demo=False,  # Also exclude spills linked to demo works
            work__gr__is_demo=False  # And ensure the GR is not demo
        ).select_related('work')
        
        # Get the 'work' parameter from query string (?work=1)
        work_id = self.request.query_params.get('work', None)
        
        if work_id is not None:
            # Filter spills by the specified Work ID (and ensure Work is not demo)
            queryset = queryset.filter(
                work_id=work_id,
                work__is_demo=False,
                is_demo=False
            )
        
        return queryset.order_by('-created_at')
   
