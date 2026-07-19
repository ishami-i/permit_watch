from django.db import models


# create a property model
class Property(models.Model):
    upi = models.CharField(max_length=50, unique=True, primary_key=True)
    physical_address = models.CharField(max_length=255)

    property_province = models.CharField(max_length=50)
    property_district = models.CharField(max_length=50, db_index=True)
    property_sector = models.CharField(max_length=50)

    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    class Meta:
        ordering = ["property_province", "property_district", "property_sector"]

    def __str__(self):
        return f"{self.upi} - {self.physical_address}"
