from django.db import models
from django.utils import timezone
from apps.works.models import Work

class TechnicalSanction(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='technical_sanctions')
    
    # Work Portion fields
    work_portion = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    testing = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    work_portion_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, help_text="GST Percentage")
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Additional fields
    consultancy = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    contingency = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    labour_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    final_total = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Checkboxes
    noting = models.BooleanField(default=False)
    order = models.BooleanField(default=False)
    
    # Checkboxes with dates - auto-fill on check
    online_offline = models.BooleanField(default=False)
    online_offline_date = models.DateField(null=True, blank=True)
    
    technical_verification = models.BooleanField(default=False)
    technical_verification_date = models.DateField(null=True, blank=True)
    
    financial_verification = models.BooleanField(default=False)
    financial_verification_date = models.DateField(null=True, blank=True)
    
    loa = models.BooleanField(default=False)
    loa_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Technical Sanction"
        verbose_name_plural = "Technical Sanctions"
    
    def save(self, *args, **kwargs):
        """Auto-populate dates when checkboxes are checked"""
        today = timezone.now().date()
        
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
        return f"TS for {self.work.name_of_work} - ₹{self.final_total}"
