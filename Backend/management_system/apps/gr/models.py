from django.db import models

class GR(models.Model):
    gr_number = models.CharField(max_length=100, unique=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Government Resolution"
        verbose_name_plural = "Government Resolutions"
        ordering = ['-date']
    
    def __str__(self):
        return f"GR {self.gr_number} - {self.date}"