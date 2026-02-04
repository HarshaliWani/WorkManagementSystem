# apps/works/models.py
from django.db import models
from django.utils import timezone
from apps.gr.models import GR
from django.core.exceptions import ValidationError
from decimal import Decimal

class Work(models.Model):
    CANCEL_REASON_CHOICES = [
        ('SHIFTED_TO_OTHER_WORK', 'Work shifted to another work'),
        ('MOVED_TO_OTHER_DEPARTMENT', 'Work assigned to different department'),
    ]
    
    gr = models.ForeignKey(GR, on_delete=models.CASCADE, related_name='works')
    date = models.DateField(blank=True, null=True)
    name_of_work = models.CharField(max_length=500)
    aa = models.DecimalField(max_digits=15, decimal_places=2, help_text="Administrative Approval")
    ra = models.DecimalField(max_digits=15, decimal_places=2, default=0, help_text="Revised Approval")
    is_demo = models.BooleanField(default=False, verbose_name="Is Demo", help_text="Mark this record as demo data for testing")
    is_cancelled = models.BooleanField(default=False, verbose_name="Is Cancelled", help_text="Mark this work as cancelled")
    cancel_reason = models.CharField(max_length=50, choices=CANCEL_REASON_CHOICES, blank=True, null=True, help_text="Reason for cancellation")
    cancel_details = models.TextField(blank=True, null=True, help_text="Additional details about cancellation (e.g., new work name, new department name, or any explanation)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Work"
        verbose_name_plural = "Works"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name_of_work} (GR: {self.gr.gr_number})"
    
    def total_ara(self):
        """Calculate total ARA (spills) for this work"""
        return self.spills.aggregate(total=models.Sum('ara'))['total'] or 0
    
    def can_add_spill(self):
        """Check if a new spill can be added (RA + ARA < AA)"""
        return (self.ra + self.total_ara()) < self.aa
    
    def save(self, *args, **kwargs):
        today = timezone.now().date()
        if not self.date:
            self.date = today
        super().save(*args, **kwargs)
    
class Spill(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='spills')
    ara = models.DecimalField(max_digits=15, decimal_places=2, help_text="Additional Revised Approval")
    is_demo = models.BooleanField(default=False, verbose_name="Is Demo", help_text="Mark this record as demo data for testing")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Spill (ARA)"
        verbose_name_plural = "Spills (ARA)"
    
    def __str__(self):
        return f"Spill {self.ara} for {self.work.name_of_work}"
    
    
    def clean(self):  
        # Calculate current total (excluding this spill if updating)
        current_spills = self.work.spills.exclude(pk=self.pk) if self.pk else self.work.spills
        total_ara = current_spills.aggregate(
            total=models.Sum('ara')
        )['total'] or Decimal('0')
        
        # Check if adding this spill exceeds AA
        if self.work.ra + total_ara + self.ara > self.work.aa:
            raise ValidationError(
                f'Cannot add spill: RA ({self.work.ra}) + Total ARA ({total_ara}) + '
                f'New ARA ({self.ara}) = {self.work.ra + total_ara + self.ara} would exceed AA ({self.work.aa})'
            )
    
    def save(self, *args, **kwargs):
        # Call full_clean() to trigger validation
        self.full_clean()
        super().save(*args, **kwargs)
