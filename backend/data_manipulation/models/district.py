# data_manipulation/models/district.py
from django.db import models

class District(models.Model):
    name = models.CharField(max_length=150, unique=True)
    code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name