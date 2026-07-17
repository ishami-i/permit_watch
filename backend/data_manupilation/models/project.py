from django.db import models
from .property import Property

# class for the project table
class Project(models.Model):
    projectId = models.CharField(max_length=50, unique=True, primary_key=True)
    building_purpose = models.CharField(max_length=250)
    building_height = models.DecimalField(max_digits=5, decimal_places=2)
    gross_floor_area = models.FloatField()
    number_of_floors = models.IntegerField()

    # importing the property model from property.py and creating a foreign key relationship with the project model
    property = models.ForeignKey(
        Property, 
        on_delete=models.CASCADE
    )

