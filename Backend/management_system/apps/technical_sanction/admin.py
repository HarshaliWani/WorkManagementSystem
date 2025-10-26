from django.contrib import admin
from .models import TechnicalSanction

@admin.register(TechnicalSanction)
class TechnicalSanctionAdmin(admin.ModelAdmin):
    list_display = ('work', 'work_portion', 'final_total', 'noting', 'order', 'created_at')
    search_fields = ('work__name_of_work',)
    list_filter = ('noting', 'order', 'created_at')
    
    fieldsets = (
        ('Work Information', {
            'fields': ('work',)
        }),
        ('Work Portion Details', {
            'fields': (
                'work_portion', 
                'royalty', 
                'testing', 
                'work_portion_total',
            ),
            'description': 'Work Portion Total = Work Portion + Royalty + Testing (Auto-calculated, but editable)'
        }),
        ('GST Calculation', {
            'fields': (
                'gst_percentage',
                'gst',
                'grand_total',
            ),
            'description': 'GST is calculated on Work Portion. Grand Total = Work Portion + Royalty + Testing + GST (Auto-calculated, but editable)'
        }),
        ('Additional Costs', {
            'fields': (
                'consultancy',
                ('contingency_percentage', 'contingency'),
                ('labour_insurance_percentage', 'labour_insurance'),
            ),
            'description': 'Contingency and Labour Insurance are calculated as % of Work Portion (Auto-calculated, but editable)'
        }),
        ('Final Total', {
            'fields': ('final_total',),
            'description': 'Final Total = Work Portion + Royalty + Testing + GST + Consultancy + Contingency + Labour Insurance (Auto-calculated, but editable)'
        }),
        ('Checkboxes & Dates', {
            'fields': (
                ('noting', 'noting_date'),
                ('order', 'order_date')
            )
        }),
    )
    
    # Show calculated suggestions in the form
    readonly_fields = ()
    
    def get_readonly_fields(self, request, obj=None):
        # Don't make any fields readonly - allow full editing
        return ()