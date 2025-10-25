from django.contrib import admin
from .models import Tender

@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    list_display = ('tender_id', 'work', 'agency_name', 'date', 'created_at')
    search_fields = ('tender_id', 'agency_name', 'work__name_of_work')
    list_filter = ('date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
