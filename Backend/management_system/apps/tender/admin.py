from django.contrib import admin
from .models import Tender

@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    list_display = ('tender_id', 'work', 'agency_name', 'date', 'created_at')
    search_fields = ('tender_id', 'agency_name', 'work__name_of_work')
    list_filter = ('date', 'online_offline', 'technical_verification', 'financial_verification', 'loa', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('work', 'technical_sanction', 'tender_id', 'date', 'agency_name')
        }),
        ('Work Order', {
            'fields': ('work_order',)
        }),
        ('Verification & Dates', {
            'fields': (
                ('online_offline', 'online_offline_date'),
                ('technical_verification', 'technical_verification_date'),
                ('financial_verification', 'financial_verification_date'),
                ('loa', 'loa_date')
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
