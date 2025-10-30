from rest_framework import serializers
from .models import TechnicalSanction

class TechnicalSanctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnicalSanction
        fields = '__all__'
