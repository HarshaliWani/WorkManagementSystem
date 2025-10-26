from django.db import models


class GR(models.Model):
    gr_number = models.CharField(max_length=100, unique=True, verbose_name="GR Number")
    date = models.DateField(verbose_name="GR Date")
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
    
    def __str__(self):
        return f"GR {self.gr_number} - {self.date}"
