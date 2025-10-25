from django.contrib import admin
from .models import TechnicalSanction

@admin.register(TechnicalSanction)
class TechnicalSanctionAdmin(admin.ModelAdmin):
    list_display = ('work', 'final_total', 'noting', 'order', 'created_at')
    search_fields = ('work__name_of_work',)
    list_filter = ('noting', 'order', 'online_offline', 'created_at')
    
    fieldsets = (
        ('Work Information', {
            'fields': ('work',)
        }),
        ('Work Portion Details', {
            'fields': ('work_portion', 'royalty', 'testing', 'work_portion_total', 'gst', 'grand_total')
        }),
        ('Additional Costs', {
            'fields': ('consultancy', 'contingency', 'labour_insurance', 'final_total')
        }),
        ('Checkboxes', {
            'fields': ('noting', 'order')
        }),
        ('Verification & Dates', {
            'fields': (
                ('online_offline', 'online_offline_date'),
                ('technical_verification', 'technical_verification_date'),
                ('financial_verification', 'financial_verification_date'),
                ('loa', 'loa_date')
            )
        }),
    )
