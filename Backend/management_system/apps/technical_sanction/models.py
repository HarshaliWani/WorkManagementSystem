from django.db import models
from django.utils import timezone
from apps.works.models import Work
from decimal import Decimal

class TechnicalSanction(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='technical_sanctions')
    
    # Work Portion fields
    work_portion = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    testing = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    work_portion_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Work Portion Total", blank=True)
    
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, verbose_name="GST %")
    gst = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="GST Amount", blank=True)
    
    grand_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Grand Total", blank=True)
    
    # Additional fields
    consultancy = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Consultancy")
    
    contingency_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=4.00, verbose_name="Contingency %")
    contingency = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Contingency Amount", blank=True)
    
    labour_insurance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.00, verbose_name="Labour Insurance %")
    labour_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Labour Insurance Amount", blank=True)
    
    final_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Final Total", blank=True)
    
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
        if self.contingency_percentage is None or self.tds_percentage == 0:
            self.contingency_percentage = Decimal('4.00')
        if self.labour_insurance_percentage is None or self.gst_on_workportion_percentage == 0:
            self.labour_insurance_percentage = Decimal('1.00')
        

        # Auto-calculate values if they haven't been manually set
        # We check if the field is 0 or matches the calculated value to auto-update
        calculated_work_portion_total = self.calculate_work_portion_total()
        calculated_gst = self.calculate_gst()
        calculated_grand_total = self.calculate_grand_total()
        calculated_contingency = self.calculate_contingency()
        calculated_labour_insurance = self.calculate_labour_insurance()
        calculated_final_total = self.calculate_final_total()
        
        # Auto-fill if field is 0 (not manually edited)
        if self.work_portion_total == 0:
            self.work_portion_total = calculated_work_portion_total
        
        if self.gst == 0:
            self.gst = calculated_gst
        
        if self.grand_total == 0:
            self.grand_total = calculated_grand_total
        
        if self.contingency == 0:
            self.contingency = calculated_contingency
        
        if self.labour_insurance == 0:
            self.labour_insurance = calculated_labour_insurance
        
        if self.final_total == 0:
            self.final_total = calculated_final_total
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"TS for {self.work.name_of_work} - ₹{self.final_total}"
