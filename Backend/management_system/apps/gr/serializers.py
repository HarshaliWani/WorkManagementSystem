from rest_framework import serializers
from .models import GR
from apps.works.serializers import WorkSerializer 
from rest_framework.exceptions import ValidationError

class GRSerializer(serializers.ModelSerializer):
    # ✅ Make sure these match your model fields
    grNumber = serializers.CharField(source='gr_number', read_only=True)
    grDate = serializers.DateField(source='date', read_only=True)
    document = serializers.FileField(required=False, allow_null=True)
    works = WorkSerializer(many=True, read_only=True)
    
    # Write fields (snake_case for POST)
    gr_number = serializers.CharField(write_only=True)
    date = serializers.DateField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = GR
        fields = ['id', 'grNumber', 'grDate', 'document', 'gr_number', 'date', 'created_at', 'updated_at', 'works']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_gr_number(self, value):
        """
        Validate that GR number is unique (except when updating the same record)
        """
        # Get the instance being updated (if any)
        instance = self.instance
        
        # Check if GR number already exists
        existing = GR.objects.filter(gr_number=value)
        
        # If updating, exclude the current instance from the check
        if instance:
            existing = existing.exclude(pk=instance.pk)
        
        if existing.exists():
            raise ValidationError(f"GR Number '{value}' already exists. Please use a different GR Number.")
        
        return value
    
    def create(self, validated_data):
        validated_data.pop('works', None)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data.pop('works', None)
        return super().update(instance, validated_data)
    
