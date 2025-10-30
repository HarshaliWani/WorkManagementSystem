from django.db import models
from django.utils import timezone


class GR(models.Model):
    gr_number = models.CharField(max_length=100, unique=True, verbose_name="GR Number")
    date = models.DateField(verbose_name="GR Date", blank=True, null=True)
    document = models.FileField(
        upload_to='gr_documents/%Y/%m/%d/', 
        null=True, 
        blank=True,
        verbose_name="GR Document",
        help_text="Upload the Government Resolution document (PDF, Word, or image)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Government Resolution"
        verbose_name_plural = "Government Resolutions"
        ordering = ['-date']
    
    def save(self, *args, **kwargs):
        # Auto-fill date with today if not provided
        if not self.date:
            self.date = timezone.now().date()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"GR {self.gr_number} - {self.date}"
