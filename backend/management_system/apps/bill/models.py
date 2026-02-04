from django.db import models
from django.utils import timezone
from apps.tender.models import Tender
from apps.gr.models import GR
from decimal import Decimal
from django.core.validators import MinValueValidator, MaxValueValidator

class Bill(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bills')
    
    bill_number = models.CharField(max_length=100)
    date = models.DateField(blank=True, null=True)
    payment_done_from_gr = models.ForeignKey(GR, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills_paid_from', verbose_name="Bill payment done from")

    work_portion = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty_and_testing = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    gst = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    reimbursement_of_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    bill_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total", blank=True)
    
    tds_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    tds = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    gst_on_workportion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    gst_on_workportion = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    security_deposit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    lwc_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    lwc = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    net_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
        
    document = models.FileField(upload_to='Bill documents/%Y/%m/', null=True, blank=True)
    
    # ✅ ADD: Override flags
    override_gst = models.BooleanField(default=False)
    override_bill_total = models.BooleanField(default=False)
    override_tds = models.BooleanField(default=False)
    override_gst_on_workportion = models.BooleanField(default=False)
    override_lwc = models.BooleanField(default=False)
    override_net_amount = models.BooleanField(default=False)
    
    is_demo = models.BooleanField(default=False, verbose_name="Is Demo", help_text="Mark this record as demo data for testing")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Bill"
        verbose_name_plural = "Bills"
    
    def calculate_gst(self):
        # Ensure both are Decimal
        work_portion = Decimal(str(self.work_portion))
        gst_percentage = Decimal(str(self.gst_percentage))
        return (work_portion * gst_percentage) / Decimal('100')
    
    def calculate_bill_total(self):
        return (Decimal(str(self.work_portion)) + 
                Decimal(str(self.royalty_and_testing)) + 
                self.calculate_gst() + 
                Decimal(str(self.reimbursement_of_insurance)))
    
    def calculate_tds(self):
        work_portion = Decimal(str(self.work_portion))
        tds_percentage = Decimal(str(self.tds_percentage))
        return (work_portion * tds_percentage) / Decimal('100')
    
    def calculate_gst_on_workportion(self):
        work_portion = Decimal(str(self.work_portion))
        gst_percentage = Decimal(str(self.gst_on_workportion_percentage))
        return (work_portion * gst_percentage) / Decimal('100')
    
    def calculate_lwc(self):
        work_portion = Decimal(str(self.work_portion))
        royalty_testing = Decimal(str(self.royalty_and_testing))
        lwc_percentage = Decimal(str(self.lwc_percentage))
        return ((work_portion + royalty_testing) * lwc_percentage) / Decimal('100')
    
    def calculate_net_amount(self):
        # Use stored values if overridden, otherwise use calculated values
        # Ensure all deduction values are positive (use abs to handle any negative values)
        if self.override_tds:
            tds = abs(Decimal(str(self.tds)))
        else:
            tds = self.calculate_tds()
        
        if self.override_gst_on_workportion:
            gst_on_workportion = abs(Decimal(str(self.gst_on_workportion)))
        else:
            gst_on_workportion = self.calculate_gst_on_workportion()
        
        if self.override_lwc:
            lwc = abs(Decimal(str(self.lwc)))
        else:
            lwc = self.calculate_lwc()
        
        security_deposit = abs(Decimal(str(self.security_deposit)))
        insurance = abs(Decimal(str(self.insurance)))
        royalty = abs(Decimal(str(self.royalty)))
        
        return (
            self.calculate_bill_total()
            - tds
            - gst_on_workportion
            - security_deposit
            - lwc
            - insurance
            - royalty
        )
    
    def save(self, *args, **kwargs):
        # Auto-fill date with today if not provided
        if not self.date:
            self.date = timezone.now().date()

        # Convert and set defaults for percentage fields
        if not self.gst_percentage or self.gst_percentage == 0:
            self.gst_percentage = Decimal('18.00')
        else:
            self.gst_percentage = Decimal(str(self.gst_percentage))
            
        if not self.tds_percentage or self.tds_percentage == 0:
            self.tds_percentage = Decimal('2.00')
        else:
            self.tds_percentage = Decimal(str(self.tds_percentage))
            
        if not self.gst_on_workportion_percentage or self.gst_on_workportion_percentage == 0:
            self.gst_on_workportion_percentage = Decimal('2.00')
        else:
            self.gst_on_workportion_percentage = Decimal(str(self.gst_on_workportion_percentage))
            
        if not self.lwc_percentage or self.lwc_percentage == 0:
            self.lwc_percentage = Decimal('1.00')
        else:
            self.lwc_percentage = Decimal(str(self.lwc_percentage))
        
        # ✅ Calculate only non-overridden fields
        if not self.override_gst:
            self.gst = self.calculate_gst()
        
        if not self.override_bill_total:
            self.bill_total = self.calculate_bill_total()
        
        if not self.override_tds:
            self.tds = self.calculate_tds()
        
        if not self.override_gst_on_workportion:
            self.gst_on_workportion = self.calculate_gst_on_workportion()
        
        if not self.override_lwc:
            self.lwc = self.calculate_lwc()
        
        if not self.override_net_amount:
            self.net_amount = self.calculate_net_amount()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Bill {self.bill_number} - ₹{self.net_amount}"
