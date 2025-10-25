from django.db import models
from apps.works.models import Work
from apps.technical_sanction.models import TechnicalSanction

class Tender(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='tenders')
    technical_sanction = models.ForeignKey(TechnicalSanction, on_delete=models.SET_NULL, null=True, blank=True)
    
    tender_id = models.CharField(max_length=100, unique=True)
    date = models.DateField()
    agency_name = models.CharField(max_length=300)
    # Organize by date uploaded
    work_order = models.FileField(upload_to='work_orders/%Y/%m/%d/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tender"
        verbose_name_plural = "Tenders"
    
    def __str__(self):
        return f"Tender {self.tender_id} - {self.agency_name}"
