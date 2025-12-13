from django.db import models
from django.utils import timezone
from apps.works.models import Work
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class TechnicalSanction(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='technical_sanctions')
    sub_name = models.CharField(max_length=255, blank=True, null=True, verbose_name="Sub Name")
    # Work Portion fields
    work_portion = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    testing = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    work_portion_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Work Portion Total", blank=True)
    
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, verbose_name="GST %", validators=[MinValueValidator(0), MaxValueValidator(100)])
    gst = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="GST Amount", blank=True)
    
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Grand Total", blank=True)
    
    # Additional fields
    consultancy = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Consultancy")
    
    contingency_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=4.00, verbose_name="Contingency %", validators=[MinValueValidator(0), MaxValueValidator(100)])
    contingency = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Contingency Amount", blank=True)
    
    labour_insurance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.00, verbose_name="Labour Insurance %", validators=[MinValueValidator(0), MaxValueValidator(100)])
    labour_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Labour Insurance Amount", blank=True)
    
    final_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Final Total", blank=True)
    
    # ✅ ADD: Override flags to track manual edits
    override_work_portion_total = models.BooleanField(default=False)
    override_gst = models.BooleanField(default=False)
    override_grand_total = models.BooleanField(default=False)
    override_contingency = models.BooleanField(default=False)
    override_labour_insurance = models.BooleanField(default=False)
    override_final_total = models.BooleanField(default=False)
    
    # Checkboxes with dates - auto-fill on check
    noting = models.BooleanField(default=False, verbose_name="Noting")
    noting_date = models.DateField(null=True, blank=True, verbose_name="Noting Date")
    
    order = models.BooleanField(default=False, verbose_name="Order")
    order_date = models.DateField(null=True, blank=True, verbose_name="Order Date")
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Technical Sanction"
        verbose_name_plural = "Technical Sanctions"
    
    def calculate_work_portion_total(self):
        """Calculate work_portion + royalty + testing"""
        return self.work_portion + self.royalty + self.testing
    
    def calculate_gst(self):
        """Calculate GST on work_portion"""
        return (self.work_portion * self.gst_percentage) / Decimal('100')
    
    def calculate_grand_total(self):
        """Calculate work_portion + royalty + testing + gst"""
        return self.work_portion + self.royalty + self.testing + self.gst
    
    def calculate_contingency(self):
        """Calculate contingency on work_portion"""
        return (self.work_portion * self.contingency_percentage) / Decimal('100')
    
    def calculate_labour_insurance(self):
        """Calculate labour insurance on work_portion"""
        return (self.work_portion * self.labour_insurance_percentage) / Decimal('100')
    
    def calculate_final_total(self):
        """Calculate final total including all costs"""
        return (self.work_portion + self.royalty + self.testing + self.gst + 
                self.consultancy + self.contingency + self.labour_insurance)

    def save(self, *args, **kwargs):
        """Auto-populate dates when checkboxes are checked"""
        today = timezone.now().date()
        
        # If checkbox is checked and date is empty, auto-fill with today's date
        if self.noting and not self.noting_date:
            self.noting_date = today
        
        if self.order and not self.order_date:
            self.order_date = today
        
        # If checkbox is unchecked, clear the date
        if not self.noting:
            self.noting_date = None
        
        if not self.order:
            self.order_date = None
        
        # Ensure percentage fields have default values if None or empty
        if self.gst_percentage is None or self.gst_percentage == 0:
            self.gst_percentage = Decimal('18.00')
        if self.contingency_percentage is None or self.contingency_percentage == 0:
            self.contingency_percentage = Decimal('4.00')
        if self.labour_insurance_percentage is None or self.labour_insurance_percentage == 0:
            self.labour_insurance_percentage = Decimal('1.00')
        

        # ✅ Calculate only non-overridden fields
        if not self.override_work_portion_total:
            self.work_portion_total = self.calculate_work_portion_total()
        
        if not self.override_gst:
            self.gst = self.calculate_gst()
        
        if not self.override_grand_total:
            self.grand_total = self.calculate_grand_total()
        
        if not self.override_contingency:
            self.contingency = self.calculate_contingency()
        
        if not self.override_labour_insurance:
            self.labour_insurance = self.calculate_labour_insurance()
        
        if not self.override_final_total:
            self.final_total = self.calculate_final_total()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"TS for {self.work.name_of_work} - ₹{self.final_total}"
