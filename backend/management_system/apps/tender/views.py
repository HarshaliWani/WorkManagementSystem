from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import Tender
from .serializers import TenderSerializer

class TenderViewSet(viewsets.ModelViewSet):
    queryset = Tender.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = TenderSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only non-demo tenders, ensuring related Works, GRs, and Technical Sanctions are not demo
        Supports filtering by: gr, work, technical_sanction (multiple filters work together)
        """
        queryset = Tender.objects.filter(
            is_demo=False,
            work__is_demo=False,  # Also exclude tenders linked to demo works
            work__gr__is_demo=False,  # And ensure the GR is not demo
            technical_sanction__is_demo=False  # And ensure the TS is not demo
        ).select_related('work', 'work__gr', 'technical_sanction')
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(
                work__gr_id=gr_id,
                is_demo=False,
                work__is_demo=False,
                work__gr__is_demo=False
            )
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(work_id=work_id, is_demo=False, work__is_demo=False)
        
        # Filter by technical_sanction if 'technical_sanction' query parameter is provided
        ts_id = self.request.query_params.get('technical_sanction', None)
        if ts_id is not None:
            queryset = queryset.filter(technical_sanction_id=ts_id, is_demo=False, technical_sanction__is_demo=False)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new tender"""
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
