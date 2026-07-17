from django.db import models
from .project import Project

# class for projects financial data
class FinancialData(models.Model):
    # importing the project model from project.py and creating a one-to-one relationship with the financial data model
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
    )

    estimated_construction_cost = models.DecimalField(
        max_digits=20, 
        decimal_places=2
    )
    contingency_10_percent = models.DecimalField(
        max_digits=20, 
        decimal_places=2 
    )
    design_fee = models.DecimalField(
        max_digits=20, 
        decimal_places=2
    )
    inspection_fee = models.DecimalField(
        max_digits=20, 
        decimal_places=2
    )
    permit_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    survey_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    total_estimated_cost = models.DecimalField(
        max_digits=20,
        decimal_places=2
    )
    currency = models.CharField(max_length=10, default='RWF')
    

