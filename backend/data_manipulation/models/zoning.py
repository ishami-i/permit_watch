from django.db import models
from .property import Property


# zoning model
class Zoning(models.Model):
    class LandUse(models.TextChoices):
        RESIDENTIAL = "residential", "Residential"
        COMMERCIAL = "commercial", "Commercial"
        INDUSTRIAL = "industrial", "Industrial"
        MIXED_USE = "mixed-use", "Mixed-use"
        AGRICULTURAL = "agricultural", "Agricultural"
        INSTITUTIONAL = "institutional", "Institutional"

    class EnvironmentalBoundary(models.TextChoices):
        NONE = "none", "None"
        WETLAND = "wetland", "Wetland"
        RIVER_BUFFER_ZONE = "river buffer zone", "River buffer zone"
        FOREST_RESERVE = "forest reserve", "Forest reserve"
        PROTECTED_AREA = "protected area", "Protected area"

    class UrbanRestriction(models.TextChoices):
        NONE = "none", "None"
        HEIGHT_RESTRICTION = "height restriction", "Height restriction"
        ROAD_RESERVE = "road reserve", "Road reserve"
        HERITAGE_ZONE = "heritage zone", "Heritage zone"
        AIRPORT_CORRIDOR = "airport corridor", "Airport corridor"
        FLOOD_RISK_AREA = "flood-risk area", "Flood-risk area"

    property = models.OneToOneField(
        Property,
        on_delete=models.CASCADE,
        related_name="zoning"
    )

    environmental_protection_boundaries = models.CharField(
        max_length=200,
        choices=EnvironmentalBoundary.choices,
        default=EnvironmentalBoundary.NONE
    )
    land_use_zoning = models.CharField(max_length=200, choices=LandUse.choices)
    permitted_building_rights = models.CharField(max_length=200)
    urban_planning_restrictions = models.CharField(
        max_length=200,
        choices=UrbanRestriction.choices,
        default=UrbanRestriction.NONE
    )

    def __str__(self):
        return f"Zoning for {self.property_id}"
