from django.db import models
from apps.gr.models import GR

class Work(models.Model):
    gr = models.ForeignKey(GR, on_delete=models.CASCADE, related_name='works')
    date = models.DateField()
    name_of_work = models.CharField(max_length=500)
    aa = models.DecimalField(max_digits=15, decimal_places=2, help_text="Administrative Approval")
    ra = models.DecimalField(max_digits=15, decimal_places=2, default=0, help_text="Revised Approval")
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
    
class Spill(models.Model):
    work = models.ForeignKey(Work, on_delete=models.CASCADE, related_name='spills')
    ara = models.DecimalField(max_digits=15, decimal_places=2, help_text="Additional Revised Approval")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Spill (ARA)"
        verbose_name_plural = "Spills (ARA)"
    
    def __str__(self):
        return f"Spill {self.ara} for {self.work.name_of_work}"
    
    def save(self, *args, **kwargs):
        # Validation: Check if spill can be added
        if not self.pk:  # Only on creation
            work = self.work
            if (work.ra + work.total_ara() + self.ara) > work.aa:
                raise ValueError("Cannot add spill: RA + ARA would exceed AA")
        super().save(*args, **kwargs)
