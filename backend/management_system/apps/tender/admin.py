from django.contrib import admin
from .models import Tender

@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    list_display = ('tender_id', 'work', 'agency_name', 'date', 'created_at')
    search_fields = ('tender_id', 'agency_name', 'work__name_of_work')
    list_filter = ('date', 'online', 'offline', 'technical_verification', 'financial_verification', 'loa', 'created_at')
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
                ('online', 'online_date'),
                ('offline', 'offline_date'),
                ('technical_verification', 'technical_verification_date'),
                ('financial_verification', 'financial_verification_date'),
                ('loa', 'loa_date'),
                ('work_order_tick', 'work_order_tick_date'),
                ('emd_supporting', 'supporting_date'),
                ('emd_awarded', 'awarded_date')
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
