from django.db import models
from .role import Role
from django.contrib.auth.models import AbstractUser
from .district import District


class User(AbstractUser):
    user_email = models.EmailField(unique=True)
    user_name = models.CharField(max_length=150)
    user_phone = models.CharField(max_length=20, blank=True)
    user_role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    user_status = models.CharField(max_length=20, default='active')
    assigned_district = models.ForeignKey(
        District,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    USERNAME_FIELD = 'user_email'
    REQUIRED_FIELDS = ['username']  # keep username here since AbstractUser still has that field

    def __str__(self):
        return self.user_email