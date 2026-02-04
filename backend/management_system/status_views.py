# status_views.py
"""
Status Dashboard API endpoint
Returns comprehensive workflow progress statistics
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Exists, OuterRef

from apps.gr.models import GR
from apps.works.models import Work
from apps.technical_sanction.models import TechnicalSanction
from apps.tender.models import Tender
from apps.bill.models import Bill


class StatusDashboardView(generics.GenericAPIView):
    """
    Status Dashboard endpoint that returns workflow progress statistics
    
    Query Parameters:
    - demo: Filter by demo mode (true/1/yes) - defaults to non-demo data
    - gr: Filter by GR ID - returns status for specific GR
    - work: Filter by Work ID - returns status for specific Work
    - page: Return only specific section (works, ts) - defaults to all sections
    
    Examples:
    - /api/status/ - Full status for all non-demo data
    - /api/status/?gr=123 - Status for GR 123
    - /api/status/?work=456 - Status for Work 456
    - /api/status/?page=works - Only works_status breakdown
    - /api/status/?page=ts - Only technical sanctions status
    - /api/status/?gr=123&page=works - Works status for GR 123
    - /api/status/?demo=true - Full status for demo data
    
    Always excludes cancelled works (is_cancelled=False)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Calculate and return comprehensive workflow statistics
        Supports drill-down with query parameters:
        - demo: Filter by demo mode (true/1/yes)
        - gr: Filter by GR ID
        - work: Filter by Work ID
        - page: Return only specific section (works, ts)
        """
        try:
            # Get query parameters
            is_demo_param = request.query_params.get('demo', None)
            gr_id = request.query_params.get('gr', None)
            work_id = request.query_params.get('work', None)
            page = request.query_params.get('page', None)
            
            # Determine if we're in demo mode
            # If demo=true is passed, use demo data, otherwise use non-demo data (is_demo=False)
            if is_demo_param and is_demo_param.lower() in ('true', '1', 'yes'):
                is_demo = True
            else:
                is_demo = False  # Default to non-demo (production) data when no parameter or invalid value
            
            # Base filters for related objects
            # IMPORTANT: Always ensure related objects match the demo status
            gr_filters = {'is_demo': is_demo}
            work_filters = {
                'is_demo': is_demo,
                'is_cancelled': False,
                'gr__is_demo': is_demo  # Ensure GR is also non-demo/demo as required
            }
            ts_filters = {
                'is_demo': is_demo,
                'work__is_demo': is_demo,
                'work__is_cancelled': False,
                'work__gr__is_demo': is_demo  # Ensure GR is also non-demo/demo as required
            }
            tender_filters = {
                'is_demo': is_demo,
                'work__is_demo': is_demo,
                'work__is_cancelled': False,
                'work__gr__is_demo': is_demo,  # Ensure GR is also non-demo/demo as required
                'technical_sanction__is_demo': is_demo
            }
            bill_filters = {
                'is_demo': is_demo,
                'tender__is_demo': is_demo,
                'tender__work__is_demo': is_demo,
                'tender__work__is_cancelled': False,
                'tender__work__gr__is_demo': is_demo,  # Ensure GR is also non-demo/demo as required
                'tender__technical_sanction__is_demo': is_demo
            }
            
            # Apply GR filter if provided
            if gr_id is not None:
                try:
                    gr_id = int(gr_id)
                    gr_filters['id'] = gr_id
                    work_filters['gr_id'] = gr_id
                    work_filters['gr__is_demo'] = is_demo
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
                        work = Work.objects.get(id=work_id, is_demo=is_demo, is_cancelled=False)
                        work_gr_id = work.gr_id
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
                # (technical_verification=False OR technical_verification=True, financial_verification=False)
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

