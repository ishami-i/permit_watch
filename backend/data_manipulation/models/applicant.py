from django.db import models


# model for the applicant table
class Applicant(models.Model):
    applicantId = models.AutoField(primary_key=True)
    national_id = models.CharField(max_length=20, unique=True)
    applicant_name = models.CharField(max_length=250)
    applicant_email = models.EmailField(max_length=150)
    applicant_phone = models.CharField(max_length=15)

    class Meta:
        ordering = ["applicant_name"]

    def __str__(self):
        return f"{self.applicant_name} ({self.national_id})"
