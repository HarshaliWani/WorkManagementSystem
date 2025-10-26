from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('bill_number', 'tender', 'net_amount', 'date', 'created_at')
    search_fields = ('bill_number', 'tender__tender_id')
    list_filter = ('date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Bill Info', {
            'fields': ('tender', 'bill_number', 'date', 'document')
        }),
        ('Bill Calculations', {
            'fields': (
                'work_portion',
                'royalty_and_testing',
                ('gst_percentage', 'gst'),
                'reimbursement_of_insurance',
                'bill_total',
            ),
            'description': 'Total = Work Portion + Royalty and Testing + GST + Insurance'
        }),
        ('Other Additions', {
            'fields': (
                ('tds_percentage', 'tds'),
                ('gst_on_workportion_percentage', 'gst_on_workportion'),
                'security_deposit',
                ('lwc_percentage', 'lwc'),
                'insurance',
                'royalty',
            ),
            'description': 'All fields are added to Net Amount'
        }),
        ('Net Amount', {
            'fields': ('net_amount',),
            'description': 'Net Amount = Sum of everything above'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
