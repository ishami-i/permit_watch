from django.db import models


class Role(models.Model):
    # Modern Django choices enumeration
    class RoleNames(models.TextChoices):
        CHIEF_OMBUDSMAN = 'Chief_Ombudsman', 'Chief Ombudsman'
        DEPUTY_OMBUDSMAN = 'Deputy_Ombudsman', 'Deputy Ombudsman'
        MONITORING_OFFICER = 'Monitoring_Officer', 'Monitoring Officer'

    roleId = models.AutoField(primary_key=True)

    # Store choices in a CharField
    role_name = models.CharField(
        max_length=50,
        choices=RoleNames.choices,
        unique=True,
        default=RoleNames.MONITORING_OFFICER
    )
    role_description = models.TextField()

    permissions = models.JSONField(  # Store permissions as a JSON object
        default=list
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["role_name"]

    # human readable representation of the model
    def __str__(self):
        return self.get_role_name_display()
