# apps/technical_sanction/serializers.py
from rest_framework import serializers
from .models import TechnicalSanction
from apps.works.models import Work


class TechnicalSanctionSerializer(serializers.ModelSerializer):
    # For reads - return calculated values (must include max_digits/decimal_places even for read_only!)
    # work field: returns work.id in responses, accepts integer ID in writes
    work = serializers.PrimaryKeyRelatedField(
        queryset=Work.objects.all(),
        required=False
    )
    work_name = serializers.CharField(source='work.name_of_work', read_only=True)
    subName = serializers.CharField(source='sub_name', read_only=True, allow_null=True)
    workPortion = serializers.DecimalField(
        source='work_portion', max_digits=15, decimal_places=2, read_only=True
    )
    workPortionTotal = serializers.DecimalField(
        source='work_portion_total', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    grandTotal = serializers.DecimalField(
        source='grand_total', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    finalTotal = serializers.DecimalField(
        source='final_total', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    gstAmount = serializers.DecimalField(
        source='gst', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    gstPercentage = serializers.DecimalField(
        source='gst_percentage',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    contingencyAmount = serializers.DecimalField(
        source='contingency', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    contingencyPercentage = serializers.DecimalField(
        source='contingency_percentage',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    labourInsuranceAmount = serializers.DecimalField(
        source='labour_insurance', 
        max_digits=15, 
        decimal_places=2, 
        read_only=True
    )
    labourInsurancePercentage = serializers.DecimalField(
        source='labour_insurance_percentage',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    Royalty = serializers.DecimalField(source='royalty', read_only=True,
        max_digits=15, decimal_places=2)
    Testing = serializers.DecimalField(source='testing', read_only=True,
        max_digits=15, decimal_places=2)
    Consultancy = serializers.DecimalField(source='consultancy', read_only=True,
        max_digits=15, decimal_places=2)
    notingDate = serializers.DateField(source='noting_date', read_only=True,
        allow_null=True)
    orderDate = serializers.DateField(source='order_date', read_only=True,
        allow_null=True)
    
    # NEW: Access GR through work relationship
    gr_id = serializers.IntegerField(source='work.gr.id', read_only=True)
    gr_name = serializers.CharField(source='work.gr.gr_number', read_only=True)
    
    # NEW: Access AA from work (use model field 'aa', not serializer field 'AA')
    aa = serializers.DecimalField(source='work.aa', read_only=True, max_digits=15, decimal_places=2)
    
    # NEW: Access work cancellation status
    work_is_cancelled = serializers.BooleanField(source='work.is_cancelled', read_only=True)
    work_cancel_reason = serializers.CharField(source='work.cancel_reason', read_only=True, allow_null=True)
    work_cancel_details = serializers.CharField(source='work.cancel_details', read_only=True, allow_null=True)
    # For writes - accept input fields
    work_portion = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    sub_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
    # Note: 'work' is defined above as read-only, so we need a separate field for writes
    # We'll use 'work' for both read and write, but handle it in create/update methods
    royalty = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    testing = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    consultancy = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    gst_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    contingency_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    labour_insurance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    # Status fields - read-write (can be both read and written)
    noting = serializers.BooleanField(required=False)
    order = serializers.BooleanField(required=False)   

    # ✅ Allow optional manual override of calculated fields
    work_portion_total = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    gst = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    grand_total = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    contingency = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    labour_insurance = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    final_total = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, write_only=True)
    

    class Meta:
        model = TechnicalSanction
        fields = [
            'id',
            'work',  # Read-only work ID (defined above as IntegerField)
            'work_name', 'subName',
            'gr_id', 'gr_name', 'aa',
            # Work cancellation status
            'work_is_cancelled', 'work_cancel_reason', 'work_cancel_details',
            # Read fields (calculated automatically)
            'workPortionTotal', 'workPortion', 'grandTotal', 'finalTotal', 
            'gstAmount', 'gstPercentage', 'contingencyAmount',
            'contingencyPercentage', 'labourInsuranceAmount','labourInsurancePercentage',
            'notingDate', 'orderDate',
            'noting', 'order',  # Status fields (read-write)
            'Royalty', 'Testing', 'Consultancy',
            # Write fields (user inputs) - work can be written as integer ID
            'sub_name', 'work_portion', 'royalty', 'testing',
            'consultancy', 'gst_percentage', 'contingency_percentage', 
            'labour_insurance_percentage',
            # Override fields (optional)
            'work_portion_total', 'gst', 'grand_total', 
            'contingency', 'labour_insurance', 'final_total',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # work field is already handled by PrimaryKeyRelatedField (accepts integer ID)
        
        # Set override flags if user provided manual values
        if 'work_portion_total' in validated_data:
            validated_data['override_work_portion_total'] = True
        if 'gst' in validated_data:
            validated_data['override_gst'] = True
        if 'grand_total' in validated_data:
            validated_data['override_grand_total'] = True
        if 'contingency' in validated_data:
            validated_data['override_contingency'] = True
        if 'labour_insurance' in validated_data:
            validated_data['override_labour_insurance'] = True
        if 'final_total' in validated_data:
            validated_data['override_final_total'] = True
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        # work field is already handled by PrimaryKeyRelatedField (accepts integer ID)
        
        # Set override flags if user provided manual values
        # If a field is NOT in validated_data, clear its override flag (allow recalculation)
        if 'work_portion_total' in validated_data:
            instance.override_work_portion_total = True
        else:
            instance.override_work_portion_total = False
            
        if 'gst' in validated_data:
            instance.override_gst = True
        else:
            instance.override_gst = False
            
        if 'grand_total' in validated_data:
            instance.override_grand_total = True
        else:
            instance.override_grand_total = False
            
        if 'contingency' in validated_data:
            instance.override_contingency = True
        else:
            instance.override_contingency = False
            
        if 'labour_insurance' in validated_data:
            instance.override_labour_insurance = True
        else:
            instance.override_labour_insurance = False
            
        if 'final_total' in validated_data:
            instance.override_final_total = True
        else:
            instance.override_final_total = False
        
        return super().update(instance, validated_data)
