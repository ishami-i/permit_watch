from django.db import models
from .project import Project
from .applicant import Applicant
from .property import Property
from .professional import Professional

# model for the permit table
class Permit(models.Model):
    permitId = models.AutoField(primary_key=True)

    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE
    )
    architect = models.ForeignKey(
        Professional,
        related_name='architect',
        on_delete=models.SET_NULL,
        null=True,
    )
    engineer = models.ForeignKey(
        Professional,
        related_name='engineer',
        on_delete=models.SET_NULL,
        null=True,
    )
    surveyor = models.ForeignKey(
        Professional,
        related_name='surveyor',
        on_delete=models.SET_NULL,
        null=True,
    )
