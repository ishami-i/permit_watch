from django.db import models


# model for the supervisors table
class Supervisor(models.Model):
    supervisorId = models.AutoField(primary_key=True)
    supervisor_name = models.CharField(max_length=100)
    # nullable: the upstream permit-simulation API only ever supplies
    # full_name, district, and phone_number for a supervisor - no email -
    # so this can't be a required, always-populated field if that's the
    # only data source feeding this table. unique=True still holds when a
    # value IS present (Django's unique constraint ignores multiple NULLs).
    supervisor_email = models.EmailField(unique=True, null=True, blank=True)
    supervisor_phone = models.CharField(max_length=20, unique=True)
    # each district has exactly one supervisor assigned to it
    district = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["district"]

    def __str__(self):
        return self.supervisor_name