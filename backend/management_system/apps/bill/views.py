# apps/bill/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from .models import Bill
from .serializers import BillSerializer


class BillViewSet(viewsets.ModelViewSet):
    queryset = Bill.objects.filter(is_demo=False)  # Exclude demo data
    serializer_class = BillSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only non-demo bills, ensuring related Tenders, Works, GRs, and Technical Sanctions are not demo
        Supports filtering by: gr, work, tender (multiple filters work together)
        """
        queryset = Bill.objects.filter(
            is_demo=False,
            tender__is_demo=False,  # Also exclude bills linked to demo tenders
            tender__work__is_demo=False,  # And ensure the Work is not demo
            tender__work__gr__is_demo=False,  # And ensure the GR is not demo
            tender__technical_sanction__is_demo=False  # And ensure the TS is not demo
        ).select_related(
            'tender',
            'tender__work',
            'tender__work__gr',
            'tender__technical_sanction',
            'payment_done_from_gr'
        )
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(
                tender__work__gr_id=gr_id,
                is_demo=False,
                tender__is_demo=False,
                tender__work__is_demo=False,
                tender__work__gr__is_demo=False
            )
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(
                tender__work_id=work_id,
                is_demo=False,
                tender__is_demo=False,
                tender__work__is_demo=False
            )
        
        # Filter by tender if 'tender' query parameter is provided
        tender_id = self.request.query_params.get('tender', None)
        if tender_id is not None:
            queryset = queryset.filter(tender_id=tender_id, is_demo=False, tender__is_demo=False)
        
        return queryset.order_by('-created_at')
    
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
