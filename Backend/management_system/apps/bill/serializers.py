# apps/bill/serializers.py
from rest_framework import serializers
from .models import Bill
from apps.tender.models import Tender


class BillSerializer(serializers.ModelSerializer):
    # For reads
    tenderId = serializers.IntegerField(source='tender.id', read_only=True)
    workId = serializers.IntegerField(source='tender.work.id', read_only=True)
    workName = serializers.CharField(source='tender.work.name_of_work', read_only=True)
    billNumber = serializers.CharField(source='bill_number', read_only=True)
    billDate = serializers.DateField(source='date', read_only=True)
    workPortion = serializers.DecimalField(source='work_portion', max_digits=15, decimal_places=2, read_only=True)
    gstPercentage = serializers.DecimalField(source='gst_percentage', max_digits=5, decimal_places=2, read_only=True)
    gstAmount = serializers.DecimalField(source='gst', max_digits=15, decimal_places=2, read_only=True)
    RoyaltyAndTesting = serializers.DecimalField(source='royalty_and_testing', max_digits=15, decimal_places=2, read_only=True)
    billTotal = serializers.DecimalField(source='bill_total', max_digits=15, decimal_places=2, read_only=True)
    tdsPercentage = serializers.DecimalField(source='tds_percentage', max_digits=5, decimal_places=2, read_only=True)
    tdsAmount = serializers.DecimalField(source='tds', max_digits=15, decimal_places=2, read_only=True)
    gstOnWorkPortionPercentage = serializers.DecimalField(source='gst_on_workportion_percentage', max_digits=5, decimal_places=2, read_only=True)
    gstOnWorkPortion = serializers.DecimalField(source='gst_on_workportion', max_digits=15, decimal_places=2, read_only=True)
    lwcPercentage = serializers.DecimalField(source='lwc_percentage', max_digits=5, decimal_places=2, read_only=True)
    lwcAmount = serializers.DecimalField(source='lwc', max_digits=15, decimal_places=2, read_only=True)
    Insurance = serializers.DecimalField(source='insurance', max_digits=15, decimal_places=2, read_only=True)
    SecurityDeposit = serializers.DecimalField(source='security_deposit', max_digits=15, decimal_places=2, read_only=True)
    ReimbursementOfInsurance = serializers.DecimalField(source='reimbursement_of_insurance', max_digits=15, decimal_places=2, read_only=True)
    Royalty = serializers.DecimalField(source='royalty', max_digits=15, decimal_places=2, read_only=True)
    netAmount = serializers.DecimalField(source='net_amount', max_digits=15, decimal_places=2, read_only=True)
    documentUrl = serializers.FileField(source='document', read_only=True)

    
    # For writes
    bill_number = serializers.CharField(write_only=True)
    date = serializers.DateField(write_only=True, required=False, allow_null=True)
    tender = serializers.PrimaryKeyRelatedField(
        queryset=Tender.objects.all(),
        write_only=True,
        required=True  # Make it required!
    )
    work_portion = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    royalty_and_testing = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    reimbursement_of_insurance = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    security_deposit = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    insurance = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    royalty = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True) 
    # Percentage fields (user can override defaults)
    gst_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    tds_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    gst_on_workportion_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    lwc_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    document = serializers.FileField(write_only=True, required=False, allow_null=True)   
    
    # ✅ Allow optional manual override of calculated fields
    gst = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for GST amount"
    )
    bill_total = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for bill total"
    )
    tds = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for TDS amount"
    )
    gst_on_workportion = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for GST on work portion"
    )
    lwc = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for LWC amount"
    )
    net_amount = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        required=False, 
        write_only=True,
        help_text="Manual override for net amount"
    )

    class Meta:
        model = Bill
        fields = [
            'id',
            # Read fields
            'tenderId',
            'workId', 'workName', 'tender', 'workPortion', 'gstPercentage', 'tdsPercentage',
            'gstOnWorkPortionPercentage', 'lwcPercentage', 'billDate', 'billNumber', 
            'RoyaltyAndTesting', 'Insurance', 'SecurityDeposit', 'ReimbursementOfInsurance', 'Royalty',
            'id','document',
            'billNumber', 'billDate', 
            'gstAmount', 'billTotal', 'tdsAmount', 'gstOnWorkPortion', 'lwcAmount', 'netAmount', 'documentUrl',

            # Write fields
            'tender', 'bill_number', 'date', 'work_portion', 
            'royalty_and_testing', 'reimbursement_of_insurance', 
            'security_deposit', 'insurance', 'royalty', 'document', 
            # Percentage fields (user can override defaults)
            'gst_percentage', 'tds_percentage', 
            'gst_on_workportion_percentage', 'lwc_percentage',
            # Override fields - optional manual values (snake_case)
            'gst', 'bill_total', 'tds',
            'gst_on_workportion', 'lwc', 'net_amount',
            # Timestamps
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Set override flags when user provides manual values"""
        if 'gst' in validated_data:
            validated_data['override_gst'] = True
        if 'bill_total' in validated_data:
            validated_data['override_bill_total'] = True
        if 'tds' in validated_data:
            validated_data['override_tds'] = True
        if 'gst_on_workportion' in validated_data:
            validated_data['override_gst_on_workportion'] = True
        if 'lwc' in validated_data:
            validated_data['override_lwc'] = True
        if 'net_amount' in validated_data:
            validated_data['override_net_amount'] = True
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Set override flags when user provides manual values"""
        if 'gst' in validated_data:
            instance.override_gst = True
        if 'bill_total' in validated_data:
            instance.override_bill_total = True
        if 'tds' in validated_data:
            instance.override_tds = True
        if 'gst_on_workportion' in validated_data:
            instance.override_gst_on_workportion = True
        if 'lwc' in validated_data:
            instance.override_lwc = True
        if 'net_amount' in validated_data:
            instance.override_net_amount = True
        
        return super().update(instance, validated_data)
