from django.db import models
from .role import Role


# create a user model
class User(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        BLOCKED = "blocked", "Blocked"

    userId = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=250)
    user_email = models.EmailField(max_length=150, unique=True)
    user_phone = models.CharField(max_length=15, unique=True)
    user_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    # import a role model from role.py and create a foreign key relationship with the user model
    user_role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="users"
    )

    class Meta:
        ordering = ["user_name"]

    def __str__(self):
        return self.user_name
