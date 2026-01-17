from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Email is used as the unique identifier instead of username.
    """
    email = models.EmailField(unique=True, verbose_name="Email Address")
    username = models.CharField(max_length=150, unique=True, verbose_name="Username")
    first_name = models.CharField(max_length=150, blank=True, verbose_name="First Name")
    last_name = models.CharField(max_length=150, blank=True, verbose_name="Last Name")
    is_approved = models.BooleanField(default=False, verbose_name="Is Approved", help_text="Designates whether this user has been approved by admin to access the system.")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
