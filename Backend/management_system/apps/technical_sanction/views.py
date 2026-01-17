from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import TechnicalSanction
from .serializers import TechnicalSanctionSerializer

class TechnicalSanctionViewSet(viewsets.ModelViewSet):
    queryset = TechnicalSanction.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = TechnicalSanctionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only non-demo technical sanctions, ensuring related Works and GRs are not demo
        Supports filtering by: gr, work (multiple filters work together)
        """
        queryset = TechnicalSanction.objects.filter(
            is_demo=False,
            work__is_demo=False,  # Also exclude TS linked to demo works
            work__gr__is_demo=False  # And ensure the GR is not demo
        ).select_related('work', 'work__gr')
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(work__gr_id=gr_id, is_demo=False, work__is_demo=False, work__gr__is_demo=False)
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(work_id=work_id, is_demo=False)
        
        return queryset.order_by('-created_at')
