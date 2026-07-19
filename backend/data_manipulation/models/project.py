from django.db import models
from .property import Property


# class for the project table
class Project(models.Model):
    projectId = models.CharField(max_length=50, unique=True, primary_key=True)
    building_purpose = models.CharField(max_length=250)
    building_height = models.DecimalField(max_digits=6, decimal_places=2)
    # was FloatField - switched to DecimalField to match the precision
    # guarantees used everywhere else in the schema (avoids float rounding
    # surprises when this value feeds into cost calculations elsewhere)
    gross_floor_area = models.DecimalField(max_digits=10, decimal_places=2)
    number_of_floors = models.PositiveIntegerField()

    # importing the property model from property.py and creating a foreign key relationship with the project model
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="projects"
    )

    def __str__(self):
        return f"{self.projectId} ({self.building_purpose})"
