"""
Demo API views - Return only demo data (is_demo=True) without authentication
"""
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError
from decimal import Decimal
from django.db.models import Q, Exists, OuterRef

# Import models
from apps.gr.models import GR
from apps.works.models import Work, Spill
from apps.technical_sanction.models import TechnicalSanction
from apps.tender.models import Tender
from apps.bill.models import Bill

# Import serializers
from apps.gr.serializers import GRSerializer
from apps.works.serializers import WorkSerializer, SpillSerializer
from apps.technical_sanction.serializers import TechnicalSanctionSerializer
from apps.tender.serializers import TenderSerializer
from apps.bill.serializers import BillSerializer


class DemoGRViewSet(viewsets.ModelViewSet):
    """Demo endpoint for GRs - returns only demo data, allows create/update/delete"""
    queryset = GR.objects.filter(is_demo=True)
    serializer_class = GRSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def perform_create(self, serializer):
        """Ensure is_demo=True when creating"""
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoWorkViewSet(viewsets.ModelViewSet):
    """Demo endpoint for Works - returns only demo data, allows create/update/delete"""
    queryset = Work.objects.filter(is_demo=True).select_related('gr').prefetch_related('spills')
    serializer_class = WorkSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter works by GR if 'gr' query parameter is provided"""
        queryset = Work.objects.filter(is_demo=True).select_related('gr').prefetch_related(
            'spills__work'  # Prefetch spills with their work relation
        )
        
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(gr_id=gr_id, is_demo=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Ensure is_demo=True and GR is demo when creating"""
        # Validate that the GR is demo
        gr_id = serializer.validated_data.get('gr_id')
        if gr_id:
            gr = GR.objects.get(id=gr_id)
            if not gr.is_demo:
                raise ValidationError("Cannot create demo work with non-demo GR")
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoSpillViewSet(viewsets.ModelViewSet):
    """Demo endpoint for Spills - returns only demo data, allows create/update/delete"""
    queryset = Spill.objects.filter(is_demo=True).select_related('work')
    serializer_class = SpillSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter spills by work if 'work' query parameter is provided"""
        queryset = Spill.objects.filter(is_demo=True).select_related('work')
        
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(work_id=work_id, is_demo=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Ensure is_demo=True and Work is demo when creating"""
        # Validate that the Work is demo
        work_id = serializer.validated_data.get('work_id')
        if work_id:
            work = Work.objects.get(id=work_id)
            if not work.is_demo:
                raise ValidationError("Cannot create demo spill with non-demo work")
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoTechnicalSanctionViewSet(viewsets.ModelViewSet):
    """Demo endpoint for Technical Sanctions - returns only demo data, allows create/update/delete"""
    queryset = TechnicalSanction.objects.filter(is_demo=True)
    serializer_class = TechnicalSanctionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Filter technical sanctions by work and/or GR if query parameters are provided
        Supports filtering by: gr, work (multiple filters work together)
        """
        queryset = TechnicalSanction.objects.filter(is_demo=True).select_related('work', 'work__gr')
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(work__gr_id=gr_id, is_demo=True, work__is_demo=True)
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(work_id=work_id, is_demo=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Ensure is_demo=True and Work is demo when creating"""
        # Validate that the Work is demo
        work_id = serializer.validated_data.get('work_id')
        if work_id:
            work = Work.objects.get(id=work_id)
            if not work.is_demo:
                raise ValidationError("Cannot create demo technical sanction with non-demo work")
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoTenderViewSet(viewsets.ModelViewSet):
    """Demo endpoint for Tenders - returns only demo data, allows create/update/delete"""
    queryset = Tender.objects.filter(is_demo=True)
    serializer_class = TenderSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """Filter tenders by work and/or GR if query parameters are provided
        Supports filtering by: gr, work, technical_sanction (multiple filters work together)
        """
        queryset = Tender.objects.filter(is_demo=True).select_related('work', 'work__gr', 'technical_sanction')
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(work__gr_id=gr_id, is_demo=True, work__is_demo=True)
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(work_id=work_id, is_demo=True, work__is_demo=True)
        
        # Filter by technical_sanction if 'technical_sanction' query parameter is provided
        ts_id = self.request.query_params.get('technical_sanction', None)
        if ts_id is not None:
            queryset = queryset.filter(technical_sanction_id=ts_id, is_demo=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Ensure is_demo=True and related objects are demo when creating"""
        # Validate that related objects are demo
        work_id = serializer.validated_data.get('work_id')
        if work_id:
            work = Work.objects.get(id=work_id)
            if not work.is_demo:
                raise ValidationError("Cannot create demo tender with non-demo work")
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoBillViewSet(viewsets.ModelViewSet):
    """Demo endpoint for Bills - returns only demo data, allows create/update/delete"""
    queryset = Bill.objects.filter(is_demo=True)
    serializer_class = BillSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        """Filter bills by tender, work, and/or GR if query parameters are provided
        Supports filtering by: gr, work, tender (multiple filters work together)
        """
        queryset = Bill.objects.filter(is_demo=True).select_related(
            'tender',
            'tender__work',
            'tender__work__gr',
            'tender__technical_sanction'
        )
        
        # Filter by GR if 'gr' query parameter is provided
        gr_id = self.request.query_params.get('gr', None)
        if gr_id is not None:
            queryset = queryset.filter(
                tender__work__gr_id=gr_id,
                is_demo=True,
                tender__is_demo=True,
                tender__work__is_demo=True
            )
        
        # Filter by work if 'work' query parameter is provided
        work_id = self.request.query_params.get('work', None)
        if work_id is not None:
            queryset = queryset.filter(
                tender__work_id=work_id,
                is_demo=True,
                tender__is_demo=True,
                tender__work__is_demo=True
            )
        
        # Filter by tender if 'tender' query parameter is provided
        tender_id = self.request.query_params.get('tender', None)
        if tender_id is not None:
            queryset = queryset.filter(tender_id=tender_id, is_demo=True, tender__is_demo=True)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Ensure is_demo=True and Tender is demo when creating"""
        # Validate that the Tender is demo
        tender_id = serializer.validated_data.get('tender_id') or serializer.validated_data.get('tender')
        if tender_id:
            from apps.tender.models import Tender
            tender = Tender.objects.get(id=tender_id)
            if not tender.is_demo:
                raise ValidationError("Cannot create demo bill with non-demo tender")
        serializer.save(is_demo=True)
    
    def perform_update(self, serializer):
        """Ensure is_demo=True when updating"""
        serializer.save(is_demo=True)


class DemoDashboardView(generics.GenericAPIView):
    """
    Demo dashboard endpoint - returns summary statistics from demo data only
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Calculate dashboard statistics from demo data, excluding cancelled works"""
        try:
            # Get all demo data
            demo_grs = GR.objects.filter(is_demo=True)
            # Exclude cancelled works from all statistics - Demo + Active only
            demo_works = Work.objects.filter(is_demo=True, is_cancelled=False).prefetch_related('spills')
            # Exclude tenders linked to cancelled works - ensure work is demo and not cancelled
            demo_tenders = Tender.objects.filter(
                is_demo=True,
                work__is_demo=True,
                work__is_cancelled=False
            )
            # Exclude bills linked to cancelled works (via tender->work) - ensure all links are demo and work is not cancelled
            demo_bills = Bill.objects.filter(
                is_demo=True,
                tender__is_demo=True,
                tender__work__is_demo=True,
                tender__work__is_cancelled=False
            )
            
            # Calculate statistics (all exclude cancelled works)
            total_grs = demo_grs.count()
            total_works = demo_works.count()
            total_tenders = demo_tenders.count()
            total_bills = demo_bills.count()
            
            # Total RA = sum of all work.RA + sum of all spill.ARA (for non-cancelled demo works only)
            total_ra = Decimal('0')
            for work in demo_works:
                total_ra += work.ra or Decimal('0')
                # Sum spills for this work (only demo spills)
                demo_spills = work.spills.filter(is_demo=True)
                for spill in demo_spills:
                    total_ra += spill.ara or Decimal('0')
            
            # Total AA = sum of all work.AA (for non-cancelled demo works only)
            total_aa = sum(work.aa or Decimal('0') for work in demo_works)
            
            # Total Expenditure = sum of all bill.bill_total (for bills linked to non-cancelled works only)
            total_expenditure = sum(bill.bill_total or Decimal('0') for bill in demo_bills)
            
            return Response({
                'total_grs': total_grs,
                'total_works': total_works,
                'total_tenders': total_tenders,
                'total_bills': total_bills,
                'total_ra': str(total_ra),
                'total_aa': str(total_aa),
                'total_expenditure': str(total_expenditure),
                'grs': GRSerializer(demo_grs.order_by('-date')[:10], many=True).data,  # Latest 10 GRs
                'works': WorkSerializer(demo_works.order_by('-created_at')[:10], many=True).data,  # Latest 10 Works (non-cancelled)
                'tenders': TenderSerializer(demo_tenders.order_by('-created_at')[:10], many=True).data,  # Latest 10 Tenders (non-cancelled works)
                'bills': BillSerializer(demo_bills.order_by('-created_at')[:10], many=True).data,  # Latest 10 Bills (non-cancelled works)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DemoStatusDashboardView(generics.GenericAPIView):
    """
    Demo Status Dashboard endpoint - returns workflow progress statistics from demo data only
    No authentication required (AllowAny)
    
    Query Parameters:
    - gr: Filter by GR ID - returns status for specific GR
    - work: Filter by Work ID - returns status for specific Work
    - page: Return only specific section (works, ts) - defaults to all sections
    
    Always excludes cancelled works (is_cancelled=False) and only returns demo data
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Calculate and return comprehensive workflow statistics for demo data only
        """
        try:
            # Get query parameters
            gr_id = request.query_params.get('gr', None)
            work_id = request.query_params.get('work', None)
            page = request.query_params.get('page', None)
            
            # Base filters - always demo data only
            gr_filters = {'is_demo': True}
            work_filters = {'is_demo': True, 'is_cancelled': False}
            ts_filters = {'is_demo': True, 'work__is_demo': True, 'work__is_cancelled': False}
            tender_filters = {
                'is_demo': True,
                'work__is_demo': True,
                'work__is_cancelled': False,
                'technical_sanction__is_demo': True
            }
            bill_filters = {
                'is_demo': True,
                'tender__is_demo': True,
                'tender__work__is_demo': True,
                'tender__work__is_cancelled': False,
                'tender__technical_sanction__is_demo': True
            }
            
            # Apply GR filter if provided
            if gr_id is not None:
                try:
                    gr_id = int(gr_id)
                    gr_filters['id'] = gr_id
                    work_filters['gr_id'] = gr_id
                    work_filters['gr__is_demo'] = True
                    ts_filters['work__gr_id'] = gr_id
                    tender_filters['work__gr_id'] = gr_id
                    bill_filters['tender__work__gr_id'] = gr_id
                except ValueError:
                    return Response({
                        'error': 'Invalid GR ID. Must be an integer.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Apply Work filter if provided
            if work_id is not None:
                try:
                    work_id = int(work_id)
                    # Validate work exists and get its GR
                    try:
                        work_obj = Work.objects.get(id=work_id, is_demo=True, is_cancelled=False)
                        work_gr_id = work_obj.gr_id
                    except Work.DoesNotExist:
                        return Response({
                            'error': f'Work with ID {work_id} not found.'
                        }, status=status.HTTP_404_NOT_FOUND)
                    
                    # If GR filter is also provided, validate that work belongs to that GR
                    if gr_id is not None and work_gr_id != gr_id:
                        return Response({
                            'error': f'Work {work_id} does not belong to GR {gr_id}.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Apply work filter
                    work_filters['id'] = work_id
                    ts_filters['work_id'] = work_id
                    tender_filters['work_id'] = work_id
                    bill_filters['tender__work_id'] = work_id
                    
                    # If work filter is applied but GR filter is not, auto-set GR filter
                    if gr_id is None:
                        gr_filters['id'] = work_gr_id
                        gr_id = work_gr_id
                except ValueError:
                    return Response({
                        'error': 'Invalid Work ID. Must be an integer.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Initialize response data with filter indicators
            response_data = {}
            
            # Add filter indicators if filters are applied
            if gr_id is not None:
                response_data['gr_filter'] = gr_id
            if work_id is not None:
                response_data['work_filter'] = work_id
            
            # Determine which sections to calculate based on page parameter
            calculate_overall = page is None
            calculate_works_status = page is None or page == 'works'
            calculate_ts_status = page is None or page == 'ts'
            calculate_tenders_status = page is None
            calculate_bills_status = page is None
            
            # 1. Overall Workflow Counts (only if not page-specific)
            if calculate_overall:
                total_grs = GR.objects.filter(**gr_filters).count()
                active_works = Work.objects.filter(**work_filters).count()
                technical_sanctions = TechnicalSanction.objects.filter(**ts_filters).count()
                tenders = Tender.objects.filter(**tender_filters).count()
                bills = Bill.objects.filter(**bill_filters).count()
                
                response_data.update({
                    "total_grs": total_grs,
                    "active_works": active_works,
                    "technical_sanctions": technical_sanctions,
                    "tenders": tenders,
                    "bills": bills
                })
            
            # 2. Works Status (grouped by stage)
            if calculate_works_status:
                # Get base works queryset
                works_queryset = Work.objects.filter(**work_filters)
                
                # no_ts_yet: Works with 0 TechnicalSanctions
                works_with_ts = TechnicalSanction.objects.filter(
                    work=OuterRef('pk'),
                    **ts_filters
                )
                no_ts_yet = works_queryset.annotate(
                    has_ts=Exists(works_with_ts)
                ).filter(has_ts=False).count()
                
                # ts_created: Works with TechnicalSanctions but no Tenders
                works_with_tenders = Tender.objects.filter(
                    work=OuterRef('pk'),
                    **tender_filters
                )
                ts_created = works_queryset.annotate(
                    has_ts=Exists(works_with_ts),
                    has_tenders=Exists(works_with_tenders)
                ).filter(has_ts=True, has_tenders=False).count()
                
                # tenders_open: Tenders in technical_verification stage or earlier
                tenders_open = Tender.objects.filter(**tender_filters).filter(
                    Q(technical_verification=False) | 
                    Q(technical_verification=True, financial_verification=False)
                ).count()
                
                # tenders_awarded: Tenders with work_order_tick=True
                tenders_awarded = Tender.objects.filter(
                    **tender_filters,
                    work_order_tick=True
                ).count()
                
                # bills_pending: Bills exist but payment not done (payment_done_from_gr is None)
                bills_pending = Bill.objects.filter(
                    **bill_filters,
                    payment_done_from_gr__isnull=True
                ).count()
                
                # completed: Bills with payment_done_from_gr=True (payment_done_from_gr is not None)
                completed = Bill.objects.filter(
                    **bill_filters,
                    payment_done_from_gr__isnull=False
                ).count()
                
                response_data["works_status"] = {
                    "no_ts_yet": no_ts_yet,
                    "ts_created": ts_created,
                    "tenders_open": tenders_open,
                    "tenders_awarded": tenders_awarded,
                    "bills_pending": bills_pending,
                    "completed": completed
                }
            
            # 3. Technical Sanctions Status
            if calculate_ts_status:
                ts_queryset = TechnicalSanction.objects.filter(**ts_filters)
                noting_stage = ts_queryset.filter(noting=True, order=False).count()
                ordering_stage = ts_queryset.filter(order=True).count()
                
                response_data["ts_status"] = {
                    "noting_stage": noting_stage,
                    "ordering_stage": ordering_stage
                }
            
            # 4. Tenders Status (only if not page-specific)
            if calculate_tenders_status:
                tender_queryset = Tender.objects.filter(**tender_filters)
                online_pending = tender_queryset.filter(online=False).count()
                technical_verification = tender_queryset.filter(
                    technical_verification=True,
                    financial_verification=False
                ).count()
                financial_verification = tender_queryset.filter(
                    financial_verification=True,
                    loa=False
                ).count()
                loa_issued = tender_queryset.filter(
                    loa=True,
                    work_order_tick=False
                ).count()
                work_order_issued = tender_queryset.filter(work_order_tick=True).count()
                
                response_data["tenders_status"] = {
                    "online_pending": online_pending,
                    "technical_verification": technical_verification,
                    "financial_verification": financial_verification,
                    "loa_issued": loa_issued,
                    "work_order_issued": work_order_issued
                }
            
            # 5. Bills Status (only if not page-specific)
            if calculate_bills_status:
                bill_queryset = Bill.objects.filter(**bill_filters)
                pending_payment = bill_queryset.filter(payment_done_from_gr__isnull=True).count()
                payment_completed = bill_queryset.filter(payment_done_from_gr__isnull=False).count()
                
                response_data["bills_status"] = {
                    "pending_payment": pending_payment,
                    "payment_completed": payment_completed
                }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
