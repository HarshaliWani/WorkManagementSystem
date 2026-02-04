from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for custom User model"""
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_staff', 'is_active', 'is_approved', 'date_joined']
    list_filter = ['is_staff', 'is_active', 'is_approved', 'date_joined']
    list_editable = ['is_approved']  # Make is_approved editable directly in the list view
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    actions = ['approve_users', 'disapprove_users']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_approved', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    def approve_users(self, request, queryset):
        """Admin action to approve selected users"""
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'{updated} user(s) approved successfully.')
    approve_users.short_description = "Approve selected users"
    
    def disapprove_users(self, request, queryset):
        """Admin action to disapprove selected users"""
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'{updated} user(s) disapproved successfully.')
    disapprove_users.short_description = "Disapprove selected users"
