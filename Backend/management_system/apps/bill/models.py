from django.db import models
from apps.tender.models import Tender

class Bill(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name='bills')
    
    bill_number = models.CharField(max_length=100)
    date = models.DateField()
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    # Organize by date uploaded
    document = models.FileField(upload_to='bills/%Y/%m/%d/', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Bill"
        verbose_name_plural = "Bills"
    
    def __str__(self):
        return f"Bill {self.bill_number} - ₹{self.amount}"
