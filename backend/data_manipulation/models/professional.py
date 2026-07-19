from django.db import models


# model for professional table
class Professional(models.Model):
    class ProfessionalType(models.TextChoices):
        ARCHITECT = "architect", "Architect"
        ENGINEER = "engineer", "Engineer"
        SURVEYOR = "surveyor", "Surveyor"

    professionalId = models.AutoField(primary_key=True)
    professional_name = models.CharField(max_length=250)
    professional_type = models.CharField(
        max_length=50,
        choices=ProfessionalType.choices
    )
    license_number = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["professional_name"]

    def __str__(self):
        return f"{self.professional_name} ({self.get_professional_type_display()})"
