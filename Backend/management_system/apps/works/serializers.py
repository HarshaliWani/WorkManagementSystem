# apps/works/serializers.py
from rest_framework import serializers
from .models import Work, Spill
from apps.gr.models import GR
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError


class SpillSerializer(serializers.ModelSerializer):
    # For reads
    ARA = serializers.DecimalField(
        source='ara', 
        max_digits=15, 
        decimal_places=2,
        read_only=True
    )
    
    # For writes
    ara = serializers.DecimalField(
        max_digits=15, 
        decimal_places=2,
        write_only=True
    )
    work_id = serializers.PrimaryKeyRelatedField(
        source='work',
        queryset=Work.objects.all(),
        write_only=True
    )

    def validate(self, data):
        """Bridge DRF validation to model validation"""        
        if self.instance:
            # Update the instance with new data for validation
            for key, value in data.items():
                setattr(self.instance, key, value)
            instance = self.instance
        else:
            # For creates, make a new temporary instance
            instance = Spill(**data)
        
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        
        return data

    class Meta:
        model = Spill
        fields = [
            'id', 
            'ARA',           # Read field (camelCase)
            'ara',           # Write field (snake_case)
            'work_id',       # Write field (for creating spill)
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class WorkSerializer(serializers.ModelSerializer):
    # For reads
    workName = serializers.CharField(source='name_of_work', read_only=True)
    workDate = serializers.DateField(source='date', read_only=True) 
    AA = serializers.DecimalField(source='aa', max_digits=15, decimal_places=2, read_only=True)
    RA = serializers.DecimalField(source='ra', max_digits=15, decimal_places=2, read_only=True)
    spills = SpillSerializer(many=True, read_only=True)
    gr = serializers.PrimaryKeyRelatedField(read_only=True) 
    isCancelled = serializers.BooleanField(source='is_cancelled', read_only=True)
    cancelReason = serializers.CharField(source='cancel_reason', read_only=True, allow_null=True)
    cancelDetails = serializers.CharField(source='cancel_details', read_only=True, allow_null=True)
    
    # For writes
    name_of_work = serializers.CharField(write_only=True)
    date = serializers.DateField(write_only=True, required=False, allow_null=True)
    aa = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    ra = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True, default=0)
    gr_id = serializers.IntegerField(write_only=True, required=False)
    is_cancelled = serializers.BooleanField(write_only=True, required=False, default=False)
    cancel_reason = serializers.ChoiceField(choices=Work.CANCEL_REASON_CHOICES, write_only=True, required=False, allow_null=True, allow_blank=True)
    cancel_details = serializers.CharField(write_only=True, required=False, allow_null=True, allow_blank=True) 

    class Meta:
        model = Work
        fields = [
            'id', 'workName', 'AA', 'RA', 'spills', 'workDate',   # Read fields
            'isCancelled', 'cancelReason', 'cancelDetails',        # Read fields (cancellation)
            'name_of_work', 'aa', 'ra', 'gr', 'gr_id','date',      # Write fields
            'is_cancelled', 'cancel_reason', 'cancel_details'       # Write fields (cancellation)
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        gr_id = validated_data.pop('gr_id', None)
        if not gr_id:
            raise ValidationError({'gr_id': 'GR is required when creating a work'})
        
        try:
            work = Work.objects.create(gr_id=gr_id, **validated_data)
            return work
        except Exception as e:
            raise ValidationError({'error': str(e)})
    
    def update(self, instance, validated_data):
        gr_id = validated_data.pop('gr_id', None)
        if gr_id:
            instance.gr_id = gr_id
        
        instance.name_of_work = validated_data.get('name_of_work', instance.name_of_work)
        instance.date = validated_data.get('date', instance.date)
        instance.aa = validated_data.get('aa', instance.aa)
        instance.ra = validated_data.get('ra', instance.ra)
        instance.is_cancelled = validated_data.get('is_cancelled', instance.is_cancelled)
        instance.cancel_reason = validated_data.get('cancel_reason', instance.cancel_reason)
        instance.cancel_details = validated_data.get('cancel_details', instance.cancel_details)
        instance.save()
        return instance
    
    def get_spills(self, obj):
        from .serializers import SpillSerializer
        return SpillSerializer(obj.spills.all(), many=True).data

    def validate_gr_id(self, value):
        """Validate that the GR exists"""
        if value and not GR.objects.filter(id=value).exists():
            raise ValidationError(f"GR with ID {value} does not exist")
        return value

    def validate(self, data):
        """Validate RA <= AA"""
        aa = data.get('aa')
        ra = data.get('ra', 0)
        
        if ra > aa:
            raise ValidationError({
                'ra': f'RA ({ra}) cannot be greater than AA ({aa})'
            })
        
        return data
    
    
