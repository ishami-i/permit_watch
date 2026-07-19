from django.db import models
from .permit import Permit
from .project import Project
from .supervisor import Supervisor
from .user import User
from .role import Role


# model for the alerts table
class Alert(models.Model):
    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("investigating", "Investigating"),
        ("resolved", "Resolved"),
        ("dismissed", "Dismissed"),
    ]

    alertId = models.AutoField(primary_key=True)
    alert_severity = models.CharField(max_length=50, choices=Severity.choices)
    alert_message = models.TextField()
    alert_timestamp = models.DateTimeField(auto_now_add=True)
    alert_status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="pending"
    )
    permit = models.ForeignKey(
        Permit,
        on_delete=models.CASCADE,
        related_name="alerts"
    )
    # get the supervisor of the permit and assign it to the alert
    supervisor = models.ForeignKey(
        Supervisor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts"
    )
    # monitoring officer assigned to the alert.
    # there is no separate MonitoringOfficer model anywhere in this schema -
    # "monitoring officer" is a Role (see role.py's RoleNames.MONITORING_OFFICER)
    # held by a User, so this now points at User rather than a model that
    # was never defined. limit_choices_to keeps the picker scoped to users
    # who actually hold that role.
    monitoring_officer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts",
        limit_choices_to={"user_role__role_name": Role.RoleNames.MONITORING_OFFICER}
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alerts"
    )

    class Meta:
        ordering = ["-alert_timestamp"]

    def __str__(self):
        return f"Alert #{self.alertId} ({self.alert_severity}, {self.alert_status})"
