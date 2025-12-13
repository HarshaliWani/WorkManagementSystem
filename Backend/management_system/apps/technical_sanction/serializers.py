# apps/technical_sanction/serializers.py
from rest_framework import serializers
from .models import TechnicalSanction
from apps.works.models import Work


class TechnicalSanctionSerializer(serializers.ModelSerializer):
    # For reads - return calculated values (must include max_digits/decimal_places even for read_only!)
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
    
    # For writes - accept input fields
    work_portion = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    sub_name = serializers.CharField(max_length=255, required=False, allow_blank=True, write_only=True)
    work = serializers.PrimaryKeyRelatedField(
        queryset=Work.objects.all(),
        write_only=True
    )
    royalty = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    testing = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    consultancy = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    gst_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    contingency_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    labour_insurance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    noting = serializers.BooleanField(write_only=True)  
    order = serializers.BooleanField(write_only=True)   

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
            'work_name', 'subName',
            # Read fields (calculated automatically)
            'workPortionTotal', 'workPortion', 'grandTotal', 'finalTotal', 
            'gstAmount', 'gstPercentage', 'contingencyAmount',
            'contingencyPercentage', 'labourInsuranceAmount','labourInsurancePercentage',
            'notingDate', 'orderDate',
            'Royalty', 'Testing', 'Consultancy',
            # Write fields (user inputs)
            'work','sub_name', 'work_portion', 'royalty', 'testing',
            'consultancy', 'gst_percentage', 'contingency_percentage', 
            'labour_insurance_percentage',
            'noting', 'order',
            # Override fields (optional)
            'work_portion_total', 'gst', 'grand_total', 
            'contingency', 'labour_insurance', 'final_total',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
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
        # Set override flags if user provided manual values
        if 'work_portion_total' in validated_data:
            instance.override_work_portion_total = True
        if 'gst' in validated_data:
            instance.override_gst = True
        if 'grand_total' in validated_data:
            instance.override_grand_total = True
        if 'contingency' in validated_data:
            instance.override_contingency = True
        if 'labour_insurance' in validated_data:
            instance.override_labour_insurance = True
        if 'final_total' in validated_data:
            instance.override_final_total = True
        
        return super().update(instance, validated_data)
