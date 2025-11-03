# apps/works/serializers.py
from rest_framework import serializers
from .models import Work, Spill
from apps.technical_sanction.serializers import TechnicalSanctionSerializer

class SpillSerializer(serializers.ModelSerializer):
    technicalSanctions = TechnicalSanctionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Spill
        fields = ['id', 'ARA', 'technicalSanctions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class WorkSerializer(serializers.ModelSerializer):
    spills = SpillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Work
        fields = ['id', 'workName', 'AA', 'RA', 'spills']
        read_only_fields = ['id']
