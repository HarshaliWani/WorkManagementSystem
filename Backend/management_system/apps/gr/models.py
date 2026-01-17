from django.db import models
from django.utils import timezone
import os
from datetime import datetime

def gr_document_upload_path(instance, filename):
    """
    Generate upload path based on GR date (not upload date)
    Format: gr_documents/YYYY/MM/filename.pdf
    Example: gr_documents/2025/12/document.pdf
    """
    # Use the GR date if available, otherwise use today
    gr_date = instance.date if instance.date else timezone.now().date()
    
    # Extract year and month from GR date
    year = gr_date.strftime('%Y')
    month = gr_date.strftime('%m')

    # Split filename and extension
    name, ext = os.path.splitext(filename)
    
    # Add timestamp if file might already exist
    timestamp = datetime.now().strftime('%H%M%S')
    new_filename = f"{name}_{timestamp}{ext}"
    
    # Generate path: gr_documents/2025/12/filename.pdf
    return os.path.join('gr_documents', year, month, new_filename)

class GR(models.Model):
    gr_number = models.CharField(max_length=100, unique=True, verbose_name="GR Number")
    date = models.DateField(verbose_name="GR Date", blank=True, null=True)
    document = models.FileField(
        upload_to=gr_document_upload_path,  # Changed from 'gr_documents/%Y/%m/%d/'
        null=True,
        blank=True,
        verbose_name="GR Document",
        help_text="Upload the Government Resolution document (PDF, Word, or image)"
    )
    is_demo = models.BooleanField(default=False, verbose_name="Is Demo", help_text="Mark this record as demo data for testing")
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
