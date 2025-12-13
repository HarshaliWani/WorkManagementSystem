from rest_framework import serializers
from .models import Tender
from apps.works.models import Work
from apps.technical_sanction.models import TechnicalSanction

class TenderSerializer(serializers.ModelSerializer):
    # For reads: return these formatted fields
    workId = serializers.IntegerField(source='work.id', read_only=True)
    workName = serializers.CharField(source='work.name_of_work', read_only=True)
    tenderNumber = serializers.CharField(source='tender_id', read_only=True)
    tenderName = serializers.CharField(source='agency_name', read_only=True)
    openingDate = serializers.DateField(source='date', read_only=True)
    status = serializers.SerializerMethodField()
    technicalSanctionId = serializers.IntegerField(source='technical_sanction.id', read_only=True, allow_null=True)
    workOrderUrl = serializers.FileField(source='work_order', read_only=True)
    onlineOffline = serializers.BooleanField(source='online_offline', read_only=True)
    onlineOfflineDate = serializers.DateField(source='online_offline_date', read_only=True)
    technicalVerification = serializers.BooleanField(source='technical_verification', read_only=True)
    technicalVerificationDate = serializers.DateField(source='technical_verification_date', read_only=True)
    financialVerification = serializers.BooleanField(source='financial_verification', read_only=True)
    financialVerificationDate = serializers.DateField(source='financial_verification_date', read_only=True)
    loa = serializers.BooleanField(read_only=True)
    loaDate = serializers.DateField(source='loa_date', read_only=True)
    
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
    required=False,
    allow_null=True
)

    class Meta:
        model = Tender
        fields = [
            # Read fields
            'workId', 'workName',
            'id', 'tenderNumber', 'tenderName', 'openingDate', 'status', 
            'technicalSanctionId', 'workOrderUrl', 'onlineOffline', 'onlineOfflineDate',
            'technicalVerification', 'technicalVerificationDate','financialVerification', 'financialVerificationDate',
            'loa', 'loaDate',
            # Write fields
            'tender_id', 'agency_name', 'date', 'work', 'technical_sanction',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_status(self, obj):
        if obj.loa:
            return 'Awarded'
        if obj.financial_verification:
            return 'Closed'
        if obj.online_offline:
            return 'Open'
        return 'Open'
    
    def create(self, validated_data):
        return Tender.objects.create(**validated_data)
