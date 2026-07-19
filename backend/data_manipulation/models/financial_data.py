from django.db import models
from .project import Project


# class for projects financial data
class FinancialData(models.Model):
    # importing the project model from project.py and creating a one-to-one relationship with the financial data model
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name="financial_data"
    )

    estimated_construction_cost = models.DecimalField(max_digits=20, decimal_places=2)
    contingency_10_percent = models.DecimalField(max_digits=20, decimal_places=2)
    design_fee = models.DecimalField(max_digits=20, decimal_places=2)
    inspection_fee = models.DecimalField(max_digits=20, decimal_places=2)
    # was max_digits=10 - bumped to match every other monetary field on this
    # model so all fees share the same ceiling instead of two silently
    # having a much lower one
    permit_fee = models.DecimalField(max_digits=20, decimal_places=2)
    survey_fee = models.DecimalField(max_digits=20, decimal_places=2)
    total_estimated_cost = models.DecimalField(max_digits=20, decimal_places=2)
    currency = models.CharField(max_length=10, default="RWF")

    def __str__(self):
        return f"Financial data for {self.project_id} ({self.total_estimated_cost} {self.currency})"
