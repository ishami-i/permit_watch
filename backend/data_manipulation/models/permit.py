from django.db import models
from .project import Project
from .applicant import Applicant
from .property import Property
from .professional import Professional
from .supervisor import Supervisor


# model for the permit table
class Permit(models.Model):
    permitId = models.AutoField(primary_key=True)

    # The simulation/API identifies permits by a string like "PERMIT-00001",
    # but permitId here is an internal auto-incrementing integer PK (by
    # design - other tables such as Project already use a natural string
    # PK, but Permit intentionally doesn't). Without *some* unique field
    # tying a row back to that external ID, re-running an import creates a
    # brand new duplicate Permit row every time instead of updating the
    # existing one. This field is what the data loader upserts against.
    external_permit_id = models.CharField(max_length=50, unique=True, null=True, blank=True)

    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name="permits"
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="permits"
    )

    # each of these was a plain FK to Professional with no guardrail, so an
    # "engineer" row could technically point at a Professional whose
    # professional_type is "architect". limit_choices_to constrains the
    # admin/form widget (and documents intent); it does not enforce the
    # rule at the database level, so pair it with a full_clean()/clean()
    # validation check before saving if this needs to be airtight.
    architect = models.ForeignKey(
        Professional,
        related_name="architect_permits",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"professional_type": Professional.ProfessionalType.ARCHITECT}
    )
    engineer = models.ForeignKey(
        Professional,
        related_name="engineer_permits",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"professional_type": Professional.ProfessionalType.ENGINEER}
    )
    surveyor = models.ForeignKey(
        Professional,
        related_name="surveyor_permits",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"professional_type": Professional.ProfessionalType.SURVEYOR}
    )
    supervisor = models.ForeignKey(
        Supervisor,
        related_name="supervised_permits",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Permit #{self.permitId} ({self.external_permit_id or 'no external ref'})"

    def clean(self):
        from django.core.exceptions import ValidationError

        for field_name, expected_type in (
            ("architect", Professional.ProfessionalType.ARCHITECT),
            ("engineer", Professional.ProfessionalType.ENGINEER),
            ("surveyor", Professional.ProfessionalType.SURVEYOR),
        ):
            professional = getattr(self, field_name)
            if professional and professional.professional_type != expected_type:
                raise ValidationError(
                    f"{field_name} must reference a Professional of type '{expected_type}'."
                )