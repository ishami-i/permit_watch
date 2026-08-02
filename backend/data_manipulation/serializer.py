"""
DRF serializers for data_manipulation.

Organized to mirror how the frontend consumes them — lightweight
"list" serializers first, then the detail/"full" serializers that
nest them together. Search for the model name in caps below to jump
to its section.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Alert,
    AlertComment,
    Applicant,
    FinancialData,
    Permit,
    Professional,
    Project,
    Property,
    Role,
    Supervisor,
    Timeline,
    Zoning,
)

User = get_user_model()



# APPLICANT


class ApplicantSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="applicantId", read_only=True)
    name = serializers.CharField(source="applicant_name", read_only=True)
    email = serializers.EmailField(source="applicant_email", read_only=True)
    phone = serializers.CharField(source="applicant_phone", read_only=True)

    class Meta:
        model = Applicant
        fields = ["id", "name", "email", "phone", "national_id"]



# PROFESSIONAL / SUPERVISOR


class ProfessionalSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="professionalId", read_only=True)
    name = serializers.CharField(source="professional_name", read_only=True)

    class Meta:
        model = Professional
        fields = ["id", "name", "professional_type", "license_number"]


class SupervisorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="supervisorId", read_only=True)
    name = serializers.CharField(source="supervisor_name", read_only=True)
    phone = serializers.CharField(source="supervisor_phone", read_only=True)
    email = serializers.EmailField(source="supervisor_email", read_only=True)

    class Meta:
        model = Supervisor
        fields = ["id", "name", "phone", "email", "district"]



# PROPERTY / ZONING


class ZoningSerializer(serializers.ModelSerializer):
    district = serializers.CharField(source="property.property_district", read_only=True)
    province = serializers.CharField(source="property.property_province", read_only=True)
    sector = serializers.CharField(source="property.property_sector", read_only=True)

    class Meta:
        model = Zoning
        fields = "__all__"


class PropertySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="upi", read_only=True)
    zoning = ZoningSerializer(read_only=True)

    class Meta:
        model = Property
        fields = "__all__"



# PROJECT / FINANCIAL DATA


class FinancialDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialData
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="projectId", read_only=True)
    upi = serializers.CharField(source="property.upi", read_only=True)
    purpose = serializers.CharField(source="building_purpose", read_only=True)
    property = PropertySerializer(read_only=True)
    financial_data = FinancialDataSerializer(read_only=True)

    # Project has no dedicated "name" or "status" field — this is a
    # placeholder display name so pages don't render blank.
    name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    def get_name(self, obj):
        return f"Project {obj.projectId}"

    def get_status(self, obj):
        return None

    class Meta:
        model = Project
        fields = "__all__"


class ProjectDetailSerializer(ProjectSerializer):
    permits = serializers.SerializerMethodField()

    def get_permits(self, obj):
        return PermitBriefSerializer(obj.permits.all(), many=True).data



# TIMELINE


class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeline
        fields = "__all__"



# ALERT (defined before PERMIT below, since FullPermitSerializer nests it)


class AlertCommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    def get_author(self, obj):
        return obj.author.user_name if obj.author else "Unknown"

    class Meta:
        model = AlertComment
        fields = ["id", "author", "text", "created_at"]


class AlertSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="alertId", read_only=True)
    severity = serializers.CharField(source="alert_severity", read_only=True)
    reason = serializers.CharField(source="alert_message", read_only=True)
    status = serializers.CharField(source="alert_status", read_only=True)
    district = serializers.SerializerMethodField()
    assigned_officer = serializers.SerializerMethodField()
    permit_id = serializers.SerializerMethodField()
    evidence = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    comments = AlertCommentSerializer(source="comment_set", many=True, read_only=True)

    def get_district(self, obj):
        if obj.supervisor and obj.supervisor.district:
            return obj.supervisor.district
        if obj.project and obj.project.property:
            return obj.project.property.property_district
        return None

    def get_assigned_officer(self, obj):
        if obj.monitoring_officer:
            return {"id": obj.monitoring_officer.id, "name": obj.monitoring_officer.user_name}
        return None

    def get_permit_id(self, obj):
        return obj.permit_id

    def get_evidence(self, obj):
        return None

    def get_timeline(self, obj):
        return []

    class Meta:
        model = Alert
        fields = [
            "id", "severity", "reason", "status", "district",
            "assigned_officer", "permit_id", "evidence", "timeline",
            "comments", "alert_timestamp",
        ]



# PERMIT


class PermitSerializer(serializers.ModelSerializer):
    """Bare permit fields, no nested relations. Used for flat/internal cases."""
    id = serializers.IntegerField(source="permitId", read_only=True)

    class Meta:
        model = Permit
        fields = "__all__"


class PermitBriefSerializer(serializers.ModelSerializer):
    """
    Lightweight permit representation used when nesting under
    Applicant/Project detail pages — avoids re-nesting permits inside
    project inside permits (infinite recursion).
    """
    id = serializers.IntegerField(source="permitId", read_only=True)
    project = ProjectSerializer(read_only=True)
    status = serializers.SerializerMethodField()
    submission_date = serializers.SerializerMethodField()

    def get_status(self, obj):
        return obj.timeline.status if hasattr(obj, "timeline") else None

    def get_submission_date(self, obj):
        return obj.timeline.submission_date if hasattr(obj, "timeline") else None

    class Meta:
        model = Permit
        fields = ["id", "external_permit_id", "status", "submission_date", "project"]


class FullPermitSerializer(serializers.ModelSerializer):
    """Permit with every related object attached — used for detail pages
    and any list view that needs the full picture (dashboard recents,
    pending/flagged lists, etc.)."""
    id = serializers.IntegerField(source="permitId", read_only=True)
    timeline = TimelineSerializer(read_only=True)
    applicant = ApplicantSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    architect = ProfessionalSerializer(read_only=True)
    engineer = ProfessionalSerializer(read_only=True)
    surveyor = ProfessionalSerializer(read_only=True)
    supervisor = SupervisorSerializer(read_only=True)
    alerts = AlertSerializer(many=True, read_only=True)

    # These live on the related Timeline row, not on Permit itself.
    status = serializers.SerializerMethodField()
    submission_date = serializers.SerializerMethodField()
    response_date = serializers.SerializerMethodField()
    resubmission = serializers.SerializerMethodField()

    def get_status(self, obj):
        return obj.timeline.status if hasattr(obj, "timeline") else None

    def get_submission_date(self, obj):
        return obj.timeline.submission_date if hasattr(obj, "timeline") else None

    def get_response_date(self, obj):
        return obj.timeline.response_date if hasattr(obj, "timeline") else None

    def get_resubmission(self, obj):
        return bool(obj.timeline.resubmission_date) if hasattr(obj, "timeline") else False

    class Meta:
        model = Permit
        fields = [
            "id",
            "permitId",
            "external_permit_id",
            "status",
            "submission_date",
            "response_date",
            "resubmission",
            "timeline",
            "applicant",
            "project",
            "architect",
            "engineer",
            "surveyor",
            "supervisor",
            "alerts",
        ]



# OFFICER (User, scoped to the Monitoring Officer role)


class OfficerSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user_name", read_only=True)
    email = serializers.EmailField(source="user_email", read_only=True)
    phone = serializers.CharField(source="user_phone", read_only=True)
    district = serializers.CharField(source="assigned_district.name", read_only=True, default=None)
    # Permits/alerts aren't directly linked to officers in the schema —
    # only Alert.monitoring_officer is. permit_count is therefore an
    # approximation (distinct permits behind this officer's alerts).
    permit_count = serializers.SerializerMethodField()
    alert_count = serializers.SerializerMethodField()
    performance_score = serializers.SerializerMethodField()

    def get_alert_count(self, obj):
        return obj.alerts.count()

    def get_permit_count(self, obj):
        return obj.alerts.values("permit_id").distinct().count()

    def get_performance_score(self, obj):
        return None  # no scoring model exists yet

    class Meta:
        model = User
        fields = ["id", "name", "email", "phone", "district", "permit_count", "alert_count", "performance_score"]



# APPLICANT DETAIL (defined last: extends ApplicantSerializer with the
# applicant's permit history, scoped to the requesting officer's district
# when one applies — see views._officer_district_name)


class ApplicantDetailSerializer(ApplicantSerializer):
    permits = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    def get_permits(self, obj):
        qs = obj.permits.select_related("project__property__zoning", "timeline")
        district = self.context.get("district")
        if district:
            qs = qs.filter(project__property__property_district=district)
        return PermitBriefSerializer(qs, many=True).data

    def get_history(self, obj):
        return []  # no activity-log model exists yet

    class Meta(ApplicantSerializer.Meta):
        fields = ApplicantSerializer.Meta.fields + ["permits", "history"]


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


# USERS (admin-only user & role management)


class RoleSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="roleId", read_only=True)
    name = serializers.CharField(source="role_name", read_only=True)
    label = serializers.CharField(source="get_role_name_display", read_only=True)

    class Meta:
        model = Role
        fields = ["id", "name", "label", "role_description"]


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user_name", read_only=True)
    email = serializers.EmailField(source="user_email", read_only=True)
    phone = serializers.CharField(source="user_phone", read_only=True)
    status = serializers.CharField(source="user_status", read_only=True)
    role = serializers.CharField(source="user_role.role_name", read_only=True, default=None)
    role_id = serializers.IntegerField(source="user_role.roleId", read_only=True, default=None)
    district = serializers.CharField(source="assigned_district.name", read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "status",
            "role",
            "role_id",
            "district",
            "is_superuser",
        ]


class UpdateUserRoleSerializer(serializers.Serializer):
    role_id = serializers.IntegerField()

    def validate_role_id(self, value):
        if not Role.objects.filter(pk=value).exists():
            raise serializers.ValidationError("That role doesn't exist.")
        return value


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Self-service (or admin) edit of a user's own name/phone.
    Deliberately excludes role/status/district — those go through
    update_user_role_view, which is admin-only."""

    name = serializers.CharField(source="user_name", required=False)
    phone = serializers.CharField(source="user_phone", required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["name", "phone"]