from django.db import models
from .role import Role

# create a user model 

class User(models.Model):
    userId = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=250)
    user_email = models.EmailField(max_length=150)
    user_phone = models.CharField(max_length=15)
    user_status = models.Choices(
        'active', 'inactive', 'blocked'
    )
    # import a role model from role.py and create a foreign key relationship with the user model
    user_role = models.ForeignKey(Role, on_delete=models.CASCADE)

    def __str__(self):
        return self.user_name