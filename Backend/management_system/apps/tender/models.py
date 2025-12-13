from django.db import models
from apps.works.models import Work
from django.utils import timezone
from apps.technical_sanction.models import TechnicalSanction

class Tender(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='tenders')
    technical_sanction = models.ForeignKey(TechnicalSanction, on_delete=models.SET_NULL, null=True, blank=True)

    # Checkboxes with dates - auto-fill on check
    online_offline = models.BooleanField(default=False)
    online_offline_date = models.DateField(null=True, blank=True)
    
    technical_verification = models.BooleanField(default=False)
    technical_verification_date = models.DateField(null=True, blank=True)
    
    financial_verification = models.BooleanField(default=False)
    financial_verification_date = models.DateField(null=True, blank=True)
    
    loa = models.BooleanField(default=False)
    loa_date = models.DateField(null=True, blank=True)

    tender_id = models.CharField(max_length=100, unique=True)
    date = models.DateField(null=True, blank=True)
    agency_name = models.CharField(max_length=300)
    # Organize by date uploaded
    work_order = models.FileField(upload_to='work_orders/%Y/%m/%d/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Tender"
        verbose_name_plural = "Tenders"

    def save(self, *args, **kwargs):
        """Auto-populate dates when checkboxes are checked"""
        today = timezone.now().date()
        
        if not self.date:
            self.date = today
        # If checkbox is checked and date is empty, auto-fill with today's date
        if self.online_offline and not self.online_offline_date:
            self.online_offline_date = today
        
        if self.technical_verification and not self.technical_verification_date:
            self.technical_verification_date = today
        
        if self.financial_verification and not self.financial_verification_date:
            self.financial_verification_date = today
        
        if self.loa and not self.loa_date:
            self.loa_date = today
        
        # If checkbox is unchecked, clear the date
        if not self.online_offline:
            self.online_offline_date = None
        
        if not self.technical_verification:
            self.technical_verification_date = None
        
        if not self.financial_verification:
            self.financial_verification_date = None
        
        if not self.loa:
            self.loa_date = None
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Tender {self.tender_id} - {self.agency_name}"
