from django.db import models

# model for the permit timeline table
class Timeline(models.Model):
    # status choises for the project timeline
    STATUS_CHOICES = [
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Under review", "Under review"),
    ]
    permit = models.OneToOneField(
        'Permit',
        on_delete=models.CASCADE,
    )
    submission_date = models.DateField()

    response_date = models.DateField(
        null=True,
        blank=True
    )
    resubmission_date = models.DateField(
        null=True,
        blank=True
    )
    permit_issurance_date = models.DateField(
        null=True,
        blank=True
    )
    permit_expiration_date = models.DateField(
        null=True,
        blank=True
    )
    review_duration = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Under review"
    )
    


     