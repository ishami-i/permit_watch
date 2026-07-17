from django.db import models
from .permit import Permit

# model for the alerts table
class Alert(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("investigating", "Investigating"),
        ("resolved", "Resolved"),
        ("dismissed", "Dismissed"),
    ]
    alertId = models.AutoField(primary_key=True)
    alert_severity = models.CharField(max_length=50)
    alert_message = models.TextField()
    alert_timestamp = models.DateTimeField(auto_now_add=True)
    alert_status  = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default="pending"
        )
    permit = models.ForeignKey(
        'Permit',
        on_delete=models.CASCADE,
        related_name='alerts'
    )