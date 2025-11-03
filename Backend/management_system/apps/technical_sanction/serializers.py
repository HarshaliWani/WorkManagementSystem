# apps/technical_sanction/serializers.py
from rest_framework import serializers
from .models import TechnicalSanction, WorkPortionItem

class WorkPortionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkPortionItem
        fields = ['id', 'item', 'cost', 'royalty', 'testing', 'subTotal', 'gst', 'total']
        read_only_fields = ['id', 'subTotal', 'gst', 'total']

class TechnicalSanctionSerializer(serializers.ModelSerializer):
    workPortion = WorkPortionItemSerializer(many=True)
    
    class Meta:
        model = TechnicalSanction
        fields = [
            'id', 'tsName', 'workPortion', 'consultancy', 
            'contingency', 'laborInsurance', 'notingDone', 
            'orderDone', 'totalAmount'
        ]
        read_only_fields = ['id', 'totalAmount']
    
    def create(self, validated_data):
        """Override create to handle nested work portions"""
        work_portions_data = validated_data.pop('workPortion')
        
        # Create the Technical Sanction
        technical_sanction = TechnicalSanction.objects.create(**validated_data)
        
        # Calculate totals and create work portion items
        total_work_amount = 0
        for wp_data in work_portions_data:
            # Calculate derived fields
            sub_total = wp_data['cost'] + wp_data['royalty'] + wp_data['testing']
            gst = sub_total * 0.18
            total = sub_total + gst
            
            WorkPortionItem.objects.create(
                technical_sanction=technical_sanction,
                item=wp_data['item'],
                cost=wp_data['cost'],
                royalty=wp_data['royalty'],
                testing=wp_data['testing'],
                subTotal=sub_total,
                gst=gst,
                total=total
            )
            total_work_amount += total
        
        # Update total amount
        technical_sanction.totalAmount = (
            total_work_amount + 
            technical_sanction.consultancy + 
            technical_sanction.contingency + 
            technical_sanction.laborInsurance
        )
        technical_sanction.save()
        
        return technical_sanction
    
    def update(self, instance, validated_data):
        """Override update to handle nested work portions"""
        work_portions_data = validated_data.pop('workPortion', None)
        
        # Update Technical Sanction fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # If work portions are provided, replace them
        if work_portions_data is not None:
            # Delete existing work portions
            instance.workPortion.all().delete()
            
            # Create new work portions
            total_work_amount = 0
            for wp_data in work_portions_data:
                sub_total = wp_data['cost'] + wp_data['royalty'] + wp_data['testing']
                gst = sub_total * 0.18
                total = sub_total + gst
                
                WorkPortionItem.objects.create(
                    technical_sanction=instance,
                    item=wp_data['item'],
                    cost=wp_data['cost'],
                    royalty=wp_data['royalty'],
                    testing=wp_data['testing'],
                    subTotal=sub_total,
                    gst=gst,
                    total=total
                )
                total_work_amount += total
            
            # Update total amount
            instance.totalAmount = (
                total_work_amount + 
                instance.consultancy + 
                instance.contingency + 
                instance.laborInsurance
            )
        
        instance.save()
        return instance
