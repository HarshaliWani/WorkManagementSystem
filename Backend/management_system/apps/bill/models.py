from django.db import models
from django.utils import timezone
from apps.tender.models import Tender

class Bill(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bills')
    
    bill_number = models.CharField(max_length=100)
    date = models.DateField()

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
        return (self.work_portion * self.gst_percentage) / 100
    
    def calculate_bill_total(self):
        return self.work_portion + self.royalty_and_testing + self.calculate_gst() + self.reimbursement_of_insurance
    
    def calculate_tds(self):
        return (self.work_portion * self.tds_percentage) / 100
    
    def calculate_gst_on_workportion(self):
        return (self.work_portion * self.gst_on_workportion_percentage) / 100
    
    def calculate_lwc(self):
        return ((self.work_portion + self.royalty_and_testing) * self.lwc_percentage) / 100
    
    def calculate_net_amount(self):
        # All fields are additions only!
        return (
            self.calculate_bill_total()
            + self.calculate_tds()
            + self.calculate_gst_on_workportion()
            + self.security_deposit
            + self.calculate_lwc()
            + self.insurance
            + self.royalty
        )
    
    def save(self, *args, **kwargs):
        # Auto-calculate each field if it is 0
        if self.gst == 0:
            self.gst = self.calculate_gst()
        if self.bill_total == 0:
            self.bill_total = self.calculate_bill_total()
        if self.tds == 0:
            self.tds = self.calculate_tds()
        if self.gst_on_workportion == 0:
            self.gst_on_workportion = self.calculate_gst_on_workportion()
        if self.lwc == 0:
            self.lwc = self.calculate_lwc()
        if self.net_amount == 0:
            self.net_amount = self.calculate_net_amount()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Bill {self.bill_number} - ₹{self.net_amount}"
