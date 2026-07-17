from django.db import models

# model for the applicant table
class Applicant(models.Model):
    national_id = models.CharField(max_length=20, unique=True, primary_key=True)
    applicant_name = models.CharField(max_length=250)
    applicant_email = models.EmailField(max_length=150)
    applicant_phone = models.CharField(max_length=15)
    
