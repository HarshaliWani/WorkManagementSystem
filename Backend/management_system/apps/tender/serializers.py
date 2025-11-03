from rest_framework import serializers
from .models import Tender

class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = [
            'id', 'tenderNumber', 'tenderName', 'estimatedAmount',
            'openingDate', 'closingDate', 'status', 'contractorName',
            'awardedAmount', 'workOrderNumber', 'workOrderDate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
