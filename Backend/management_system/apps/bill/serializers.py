from rest_framework import serializers
from .models import Bill

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = [
            'id', 'billNumber', 'billDate', 'billAmount',
            'billType', 'workCompletedPercentage', 'status',
            'approvalDate', 'paymentDate', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
