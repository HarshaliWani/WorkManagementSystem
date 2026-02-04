from django.contrib import admin
from .models import GR

@admin.register(GR)
class GRAdmin(admin.ModelAdmin):
    list_display = ('gr_number', 'date', 'has_document', 'created_at')
    search_fields = ('gr_number',)
    list_filter = ('date', 'created_at')
    ordering = ('-date',)
    
    fieldsets = (
        ('GR Information', {
            'fields': ('gr_number', 'date')
        }),
        ('Document', {
            'fields': ('document',),
            'description': 'Upload the Government Resolution document'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def has_document(self, obj):
        """Show if GR has a document attached"""
        return bool(obj.document)
    has_document.boolean = True
    has_document.short_description = 'Document Uploaded'
