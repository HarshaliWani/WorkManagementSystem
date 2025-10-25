from django.contrib import admin
from .models import Bill

@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('bill_number', 'tender', 'amount', 'date', 'created_at')
    search_fields = ('bill_number', 'tender__tender_id')
    list_filter = ('date', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
