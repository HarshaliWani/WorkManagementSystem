from rest_framework import serializers
from .models import Tender
from apps.works.models import Work
from apps.technical_sanction.models import TechnicalSanction

class TenderSerializer(serializers.ModelSerializer):
    # For reads: return these formatted fields
    workId = serializers.IntegerField(source='work.id', read_only=True)
    workName = serializers.CharField(source='work.name_of_work', read_only=True)
    workDate = serializers.DateField(source='work.date', read_only=True)
    # Work cancellation status
    work_is_cancelled = serializers.BooleanField(source='work.is_cancelled', read_only=True)
    work_cancel_reason = serializers.CharField(source='work.cancel_reason', read_only=True, allow_null=True)
    work_cancel_details = serializers.CharField(source='work.cancel_details', read_only=True, allow_null=True)
    tenderNumber = serializers.CharField(source='tender_id', read_only=True)
    tenderName = serializers.CharField(source='agency_name', read_only=True)
    openingDate = serializers.DateField(source='date', read_only=True)
    status = serializers.SerializerMethodField()
    technicalSanctionId = serializers.IntegerField(source='technical_sanction.id', read_only=True)
    technicalSanctionSubName = serializers.CharField(source='technical_sanction.sub_name', read_only=True)
    workOrderUrl = serializers.FileField(source='work_order', read_only=True)
    workOrderUploaded = serializers.SerializerMethodField()
    technicalVerification = serializers.BooleanField(source='technical_verification', read_only=True)
    technicalVerificationDate = serializers.DateField(source='technical_verification_date', read_only=True)
    financialVerification = serializers.BooleanField(source='financial_verification', read_only=True)
    financialVerificationDate = serializers.DateField(source='financial_verification_date', read_only=True)
    loaDate = serializers.DateField(source='loa_date', read_only=True)
    workOrderTick = serializers.BooleanField(source='work_order_tick', read_only=True)
    workOrderTickDate = serializers.DateField(source='work_order_tick_date', read_only=True)
    emdSupporting = serializers.BooleanField(source='emd_supporting', read_only=True)
    supportingDate = serializers.DateField(source='supporting_date', read_only=True)
    emdAwarded = serializers.BooleanField(source='emd_awarded', read_only=True)
    awardedDate = serializers.DateField(source='awarded_date', read_only=True)
    Online = serializers.BooleanField(source='online', read_only=True)
    onlineDate = serializers.DateField(source='online_date', read_only=True)
    Offline = serializers.BooleanField(source='offline', read_only=True)
    offlineDate = serializers.DateField(source='offline_date', read_only=True)
    
    # For writes: accept these
    tender_id = serializers.CharField(required=True, write_only=True)
    agency_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    date = serializers.DateField(required=False, allow_null=True, write_only=True)
    work = serializers.PrimaryKeyRelatedField(
        queryset=Work.objects.all(),
        write_only=True
    )
    technical_sanction = serializers.PrimaryKeyRelatedField(
    queryset=TechnicalSanction.objects.all(),
    write_only=True,
        required=True
    )
    
    # Write-only fields for dates
    online = serializers.BooleanField(write_only=True, required=False)
    online_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    offline = serializers.BooleanField(write_only=True, required=False)
    offline_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    technical_verification = serializers.BooleanField(write_only=True, required=False)
    technical_verification_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    financial_verification = serializers.BooleanField(write_only=True, required=False)
    financial_verification_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    # loa is read-write (model field, automatically handled by DRF)
    loa_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    work_order_tick = serializers.BooleanField(write_only=True, required=False)
    work_order_tick_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    emd_supporting = serializers.BooleanField(write_only=True, required=False)
    supporting_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    emd_awarded = serializers.BooleanField(write_only=True, required=False)
    awarded_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    work_order = serializers.FileField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Tender
        fields = [
            # Read fields
            'workId', 'workName', 'workDate',
            # Work cancellation status
            'work_is_cancelled', 'work_cancel_reason', 'work_cancel_details',
            'id', 'tenderNumber', 'tenderName', 'openingDate', 'status', 
            'Online', 'onlineDate', 'Offline', 'offlineDate',
            'technicalSanctionId', 'technicalSanctionSubName', 'workOrderUrl', 'workOrderUploaded',
            'technicalVerification', 'technicalVerificationDate','financialVerification', 'financialVerificationDate',
            'loa', 'loaDate',
            'workOrderTick', 'workOrderTickDate',
            'emdSupporting', 'supportingDate',
            'emdAwarded', 'awardedDate',
            # Write fields
            'tender_id', 'agency_name', 'date', 'work', 'technical_sanction',
            'online', 'online_date', 'offline', 'offline_date',
            'technical_verification', 'technical_verification_date',
            'financial_verification', 'financial_verification_date',
            'loa', 'loa_date',
            'work_order', 'work_order_tick', 'work_order_tick_date',
            'emd_supporting', 'supporting_date',
            'emd_awarded', 'awarded_date',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_status(self, obj):
        if obj.loa:
            return 'Awarded'
        if obj.work_order:  # Closed only if work order is uploaded
            return 'Closed'
        return 'Open'
    
    def get_workOrderUploaded(self, obj):
        return bool(obj.work_order)
    
    def create(self, validated_data):
        return Tender.objects.create(**validated_data)
