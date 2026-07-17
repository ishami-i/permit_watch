from django.db import models

# model for professional table
class Professional(models.Model):
    PROFESSIONAL_TYPES = [
        ("architect", "Architect"),
        ("engineer", "Engineer"),
        ("surveyor", "Surveyor"),
    ]
    professionalId = models.AutoField(primary_key=True)
    professional_name = models.CharField(max_length=250)
    professional_type = models.CharField(max_length=50, choices=PROFESSIONAL_TYPES)
    license_number = models.CharField(max_length=50, unique=True)