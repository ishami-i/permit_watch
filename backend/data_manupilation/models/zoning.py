from django.db import models
from .property import Property

# zoning model
class Zoning(models.Model):
    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
    )

    environmental_protection_boundaries = models.CharField(max_length=200)
    land_use_zoning = models.CharField(max_length=200)
    permitted_buildig_rights = models.CharField(max_length=200)
    urban_planning_restrictions = models.CharField(max_length=200)