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
    AA = serializers.DecimalField(source='aa', max_digits=15, decimal_places=2, read_only=True)
    RA = serializers.DecimalField(source='ra', max_digits=15, decimal_places=2, read_only=True)
    spills = SpillSerializer(many=True, read_only=True)
    Gr = serializers.PrimaryKeyRelatedField(read_only=True) 
    
    # For writes
    name_of_work = serializers.CharField(write_only=True)
    aa = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True)
    ra = serializers.DecimalField(max_digits=15, decimal_places=2, write_only=True, default=0)
    gr = serializers.PrimaryKeyRelatedField(
        queryset=GR.objects.all(),
        write_only=True
    )
    gr_id = serializers.IntegerField(write_only=True, required=False) 

    class Meta:
        model = Work
        fields = [
            'id', 'workName', 'AA', 'RA', 'spills', 'Gr',  # Read fields
            'name_of_work', 'aa', 'ra', 'gr', 'gr_id'       # Write fields
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        gr_id = validated_data.pop('gr_id', None)
        work = Work.objects.create(gr_id=gr_id, **validated_data)
        return work
    
    def update(self, instance, validated_data):
        gr_id = validated_data.pop('gr_id', None)
        if gr_id:
            instance.gr_id = gr_id
        
        instance.name_of_work = validated_data.get('name_of_work', instance.name_of_work)
        instance.aa = validated_data.get('aa', instance.aa)
        instance.ra = validated_data.get('ra', instance.ra)
        instance.save()
        return instance
    
    
