from django.db import models


# model for the permit timeline table
class Timeline(models.Model):
    # status choices for the project timeline
    STATUS_CHOICES = [
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Under review", "Under review"),
    ]
    permit = models.OneToOneField(
        'Permit',
        on_delete=models.CASCADE,
        related_name="timeline"
    )
    submission_date = models.DateField()

    response_date = models.DateField(null=True, blank=True)
    resubmission_date = models.DateField(null=True, blank=True)
    # was "permit_issurance_date" - typo fixed
    permit_issuance_date = models.DateField(null=True, blank=True)
    permit_expiration_date = models.DateField(null=True, blank=True)
    # nullable: a permit still "Under review" may not have a settled duration yet
    review_duration = models.IntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Under review"
    )

    def __str__(self):
        return f"Timeline for permit {self.permit_id} - {self.status}"
