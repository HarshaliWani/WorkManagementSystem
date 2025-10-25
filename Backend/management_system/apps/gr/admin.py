from django.contrib import admin
from .models import GR

@admin.register(GR)
class GRAdmin(admin.ModelAdmin):
    list_display = ('gr_number', 'date', 'created_at')
    search_fields = ('gr_number',)
    list_filter = ('date',)
    ordering = ('-date',)
