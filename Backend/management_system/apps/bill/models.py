from django.db import models
from django.utils import timezone
from apps.tender.models import Tender
from decimal import Decimal

class Bill(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bills')
    
    bill_number = models.CharField(max_length=100)
    date = models.DateField(blank=True, null=True)

    work_portion = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty_and_testing = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    gst = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    reimbursement_of_insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    bill_total = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Total", blank=True)
    
    tds_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)
    tds = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    gst_on_workportion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.00)
    gst_on_workportion = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    security_deposit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    lwc_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    lwc = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
    
    insurance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    royalty = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    net_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, blank=True)
        
    document = models.FileField(upload_to='bills/%Y/%m/%d/', null=True, blank=True)
    
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
        return (
            self.calculate_bill_total()
            + self.calculate_tds()
            + self.calculate_gst_on_workportion()
            + Decimal(str(self.security_deposit))
            + self.calculate_lwc()
            + Decimal(str(self.insurance))
            + Decimal(str(self.royalty))
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
        
        # Auto-calculate fields if they are 0
        if not self.gst or self.gst == 0:
            self.gst = self.calculate_gst()
        if not self.bill_total or self.bill_total == 0:
            self.bill_total = self.calculate_bill_total()
        if not self.tds or self.tds == 0:
            self.tds = self.calculate_tds()
        if not self.gst_on_workportion or self.gst_on_workportion == 0:
            self.gst_on_workportion = self.calculate_gst_on_workportion()
        if not self.lwc or self.lwc == 0:
            self.lwc = self.calculate_lwc()
        if not self.net_amount or self.net_amount == 0:
            self.net_amount = self.calculate_net_amount()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Bill {self.bill_number} - ₹{self.net_amount}"
