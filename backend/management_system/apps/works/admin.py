from django.contrib import admin
from .models import Work, Spill

class SpillInline(admin.TabularInline):
    model = Spill
    extra = 1
    readonly_fields = ('created_at',)

@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = ('date','name_of_work', 'gr', 'aa', 'ra', 'is_cancelled', 'created_at')
    search_fields = ('name_of_work', 'gr__gr_number')
    list_filter = ('created_at', 'is_cancelled', 'cancel_reason')
    readonly_fields = ('total_ara', 'can_add_spill')
    inlines = [SpillInline]  # This shows spills on the Work page
    
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('date','gr', 'name_of_work')
        }),
        ('Financial Details', {
            'fields': ('aa', 'ra')
        }),
        ('Cancellation Information', {
            'fields': ('is_cancelled', 'cancel_reason', 'cancel_details'),
            'classes': ('collapse',)
        }),
        ('Spill Information', {
            'fields': ('total_ara', 'can_add_spill'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Spill)
class SpillAdmin(admin.ModelAdmin):
    list_display = ('work', 'ara', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('work__name_of_work',)
