from django.db import models

# create a property model
class Property(models.Model):
    upi = models.CharField(max_length=50, unique=True, primary_key=True)
    physical_address = models.CharField()

    property_province = models.CharField(max_length=50)
    property_district = models.CharField(max_length=50)
    property_sector = models.CharField(max_length=50)

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)