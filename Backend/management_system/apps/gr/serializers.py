# apps/gr/serializers.py
from rest_framework import serializers
from .models import GR
from apps.works.models import Work

class WorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Work
        fields = ['id', 'workName', 'AA', 'RA', 'spills']

class GRSerializer(serializers.ModelSerializer):
    works = WorkSerializer(many=True, read_only=True)
    
    class Meta:
        model = GR
        fields = ['id', 'grNumber', 'grDate', 'works']
