from rest_framework import serializers
from .models import GR
from apps.works.serializers import WorkSerializer 

class GRSerializer(serializers.ModelSerializer):
    # ✅ Make sure these match your model fields
    grNumber = serializers.CharField(source='gr_number', read_only=True)
    grDate = serializers.DateField(source='date', read_only=True)
    document = serializers.FileField(read_only=True)
    works = WorkSerializer(many=True, read_only=True)
    
    # Write fields (snake_case for POST)
    gr_number = serializers.CharField(write_only=True)
    date = serializers.DateField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = GR
        fields = ['id', 'grNumber', 'grDate', 'document', 'gr_number', 'date', 'created_at', 'updated_at', 'works']
        read_only_fields = ['id', 'created_at', 'updated_at']

    
