from django.db import models
from apps.works.models import Work
from django.utils import timezone
from apps.technical_sanction.models import TechnicalSanction

class Tender(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='tenders')
    technical_sanction = models.ForeignKey(TechnicalSanction, on_delete=models.CASCADE, related_name='tenders')

    # Checkboxes with dates - auto-fill on check
    online = models.BooleanField(default=False)
    online_date = models.DateField(null=True, blank=True)

    offline = models.BooleanField(default=False)
    offline_date = models.DateField(null=True, blank=True)
    
    technical_verification = models.BooleanField(default=False)
    technical_verification_date = models.DateField(null=True, blank=True)
    
    financial_verification = models.BooleanField(default=False)
    financial_verification_date = models.DateField(null=True, blank=True)
    
    loa = models.BooleanField(default=False)
    loa_date = models.DateField(null=True, blank=True)

    work_order_tick = models.BooleanField(default=False)
    work_order_tick_date = models.DateField(null=True, blank=True)

    emd_supporting = models.BooleanField(default=False)
    supporting_date = models.DateField(null=True, blank=True)

    emd_awarded = models.BooleanField(default=False)
    awarded_date = models.DateField(null=True, blank=True)
    

    tender_id = models.CharField(max_length=100, unique=True)
    date = models.DateField(null=True, blank=True)
    agency_name = models.CharField(max_length=300)
    # Organize by year and month only
    work_order = models.FileField(upload_to='Tender work orders/%Y/%m/', null=True, blank=True)
    is_demo = models.BooleanField(default=False, verbose_name="Is Demo", help_text="Mark this record as demo data for testing")
    
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
        if self.online and not self.online_date:
            self.online_date = today
        
        if self.offline and not self.offline_date:
            self.offline_date = today
        
        if self.technical_verification and not self.technical_verification_date:
            self.technical_verification_date = today
        
        if self.financial_verification and not self.financial_verification_date:
            self.financial_verification_date = today
        
        if self.loa and not self.loa_date:
            self.loa_date = today
        
        if self.work_order_tick and not self.work_order_tick_date:
            self.work_order_tick_date = today
        
        if self.emd_supporting and not self.supporting_date:
            self.supporting_date = today
        
        if self.emd_awarded and not self.awarded_date:
            self.awarded_date = today
        
        # If checkbox is unchecked, clear the date
        if not self.online:
            self.online_date = None
        
        if not self.offline:
            self.offline_date = None
        
        if not self.technical_verification:
            self.technical_verification_date = None
        
        if not self.financial_verification:
            self.financial_verification_date = None
        
        if not self.loa:
            self.loa_date = None

        if not self.work_order_tick:
            self.work_order_tick_date = None
        
        if not self.emd_supporting:
            self.supporting_date = None
        
        if not self.emd_awarded:
            self.awarded_date = None
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Tender {self.tender_id} - {self.agency_name}"
