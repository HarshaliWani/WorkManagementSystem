from rest_framework import serializers
from .models import GR

class grSerializer(serializers.ModelSerializer):
    class Meta:
        model = GR
        fields = '__all__'
