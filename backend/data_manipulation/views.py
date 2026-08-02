"""
JSON API views for data_manipulation.

Grouped into sections matching urls.py, in the same order — search for
the ALL-CAPS section header for the resource you need (AUTH, DASHBOARD,
PERMITS, PROJECTS, APPLICANTS, ALERTS, OFFICERS, DISTRICTS). Shared
helpers live at the top, right after the imports.
"""
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from data_manipulation.models import (
    Alert,
    AlertComment,
    Applicant,
    District,
    Permit,
    Project,
    Property,
    Role,
)
from data_manipulation.serializer import (
    AlertSerializer,
    ApplicantDetailSerializer,
    ApplicantSerializer,
    ChangePasswordSerializer,
    FullPermitSerializer,
    OfficerSerializer,
    ProjectDetailSerializer,
    ProjectSerializer,
    RoleSerializer,
    UpdateUserRoleSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)
from data_manipulation.services.auth_service import change_password
from data_manipulation.services.flagged_project import (
    get_flagged_permits,
    get_flagged_projects,
    insert_flagged_permit,
)
from data_manipulation.services.get_permit import (
    get_all_full_permits,
    get_all_permits,
    get_full_permit_data,
    get_permit_data,
)

User = get_user_model()



# HELPERS


def _permit_base_queryset():
    return Permit.objects.select_related(
        "timeline", "applicant", "project", "project__property",
        "project__financial_data", "project__property__zoning",
        "architect", "engineer", "surveyor", "supervisor",
    )


def _officer_district_name(request):
    """Returns the officer's district name if this user is a Monitoring
    Officer with a district assigned, else None (meaning: no scoping)."""
    user = request.user
    role = user.user_role.role_name if user.user_role else None
    if role == Role.RoleNames.MONITORING_OFFICER and user.assigned_district:
        return user.assigned_district.name
    return None


_ADMIN_ROLES = {Role.RoleNames.CHIEF_OMBUDSMAN, Role.RoleNames.DEPUTY_OMBUDSMAN}


def _is_admin(user):
    """Django superusers and Chief/Deputy Ombudsman roles can manage users."""
    if user.is_superuser:
        return True
    return bool(user.user_role and user.user_role.role_name in _ADMIN_ROLES)



# AUTH


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    return Response({
        "id": user.id,
        "name": user.user_name,
        "email": user.user_email,
        "role": user.user_role.role_name.lower() if user.user_role else None,
        "district": user.assigned_district.name if user.assigned_district else None,
        "is_superuser": user.is_superuser,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    return Response({"detail": "Logged out."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    POST /auth/change-password/
    Body: { "current_password": "...", "new_password": "..." }
    """
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    change_password(
        user=request.user,
        current_password=serializer.validated_data["current_password"],
        new_password=serializer.validated_data["new_password"],
    )

    return Response({"detail": "Password updated successfully."}, status=200)


# USERS (list/role changes are admin-only; a user may also view/edit their own record)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def users_list_view(request):
    if not _is_admin(request.user):
        return Response({"detail": "You don't have permission to view users."}, status=403)

    users = User.objects.select_related("user_role", "assigned_district").order_by("user_name")
    return Response(UserSerializer(users, many=True).data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def user_detail_view(request, user_id):
    is_self = request.user.id == user_id
    if not is_self and not _is_admin(request.user):
        return Response({"detail": "You don't have permission to access this user."}, status=403)

    user = get_object_or_404(
        User.objects.select_related("user_role", "assigned_district"), pk=user_id
    )

    if request.method == "GET":
        return Response(UserSerializer(user).data)

    serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(UserSerializer(user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_role_view(request, user_id):
    if not _is_admin(request.user):
        return Response({"detail": "You don't have permission to change roles."}, status=403)

    user = get_object_or_404(User, pk=user_id)

    serializer = UpdateUserRoleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user.user_role = Role.objects.get(pk=serializer.validated_data["role_id"])
    user.save(update_fields=["user_role"])

    return Response(UserSerializer(user).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def roles_list_view(request):
    if not _is_admin(request.user):
        return Response({"detail": "You don't have permission to view roles."}, status=403)

    return Response(RoleSerializer(Role.objects.all(), many=True).data)



# DASHBOARD


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary_view(request):
    total_permits = Permit.objects.count()
    flagged_permit_ids = Alert.objects.values_list("permit_id", flat=True).distinct()
    flagged_permits = flagged_permit_ids.count()

    total_applicants = Applicant.objects.count()
    total_projects = Project.objects.count()

    officers = User.objects.filter(user_role__role_name=Role.RoleNames.MONITORING_OFFICER)
    total_officers = officers.count()

    covered_district_ids = officers.exclude(assigned_district__isnull=True).values_list(
        "assigned_district_id", flat=True
    ).distinct()
    covered_districts = len(set(covered_district_ids))
    uncovered_districts = District.objects.count() - covered_districts

    pending_alerts = Alert.objects.filter(alert_status="pending").count()
    resolved_alerts = Alert.objects.filter(alert_status="resolved").count()

    permits_by_province = (
        Permit.objects.values("project__property__property_province")
        .annotate(value=Count("permitId"))
        .order_by()
    )
    permits_by_district = (
        Permit.objects.values("project__property__property_district")
        .annotate(value=Count("permitId"))
        .order_by()
    )
    alerts_by_severity = (
        Alert.objects.values("alert_severity")
        .annotate(value=Count("alertId"))
        .order_by()
    )

    monthly_trend_qs = (
        Permit.objects.filter(timeline__submission_date__isnull=False)
        .annotate(month=TruncMonth("timeline__submission_date"))
        .values("month")
        .annotate(value=Count("permitId"))
        .order_by("month")
    )
    monthly_trend = [
        {"month": row["month"].strftime("%b %Y"), "count": row["value"]}
        for row in monthly_trend_qs
    ]

    recent_permits_qs = (
        Permit.objects.filter(timeline__submission_date__isnull=False)
        .select_related("applicant", "project__property__zoning", "timeline")
        .order_by("-timeline__submission_date")[:5]
    )
    recent_permits = FullPermitSerializer(recent_permits_qs, many=True).data

    return Response({
        "total_permits": total_permits,
        "flagged_permits": flagged_permits,
        "total_applicants": total_applicants,
        "total_projects": total_projects,
        "total_officers": total_officers,
        "covered_districts": covered_districts,
        "uncovered_districts": uncovered_districts,
        "pending_alerts": pending_alerts,
        "resolved_alerts": resolved_alerts,
        "permits_by_province": [
            {"name": row["project__property__property_province"] or "Unknown", "value": row["value"]}
            for row in permits_by_province
        ],
        "permits_by_district": [
            {"name": row["project__property__property_district"] or "Unknown", "value": row["value"]}
            for row in permits_by_district
        ],
        "monthly_trend": monthly_trend,
        "alerts_by_severity": [
            {"severity": row["alert_severity"], "value": row["value"]}
            for row in alerts_by_severity
        ],
        "officer_workload": [
            {"officer": o.user_name, "permits": 0}
            for o in officers
        ],
        "recent_permits": recent_permits,
        "recent_alerts": [
            {
                "id": a.alertId,
                "reason": a.alert_message,
                "district": a.project.property.property_district if a.project and a.project.property else None,
                "severity": a.alert_severity,
            }
            for a in Alert.objects.order_by("-alert_timestamp")[:5]
        ],
    })



# PERMITS


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def permit_data_view(request, permit_id):
    """Fetches a single permit and returns its basic serialized JSON payload."""
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    return get_permit_data(permit)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_permit_data_view(request):
    """Returns an aggregated list of all basic serialized permits in JSON format,
    scoped to the requesting officer's district if they have one assigned."""
    qs = _permit_base_queryset()
    district = _officer_district_name(request)
    if district:
        qs = qs.filter(project__property__property_district=district)
    return get_all_permits(qs)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def full_permit_data_view(request, permit_id):
    """Fetches a single permit with all extended relational dependencies in JSON format."""
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    return get_full_permit_data(permit)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_full_permit_data_view(request):
    """Returns an aggregated list of all full permits along with related
    object histories, scoped to the requesting officer's district if any."""
    qs = _permit_base_queryset()
    district = _officer_district_name(request)
    if district:
        qs = qs.filter(project__property__property_district=district)
    return get_all_full_permits(qs)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_permit_data_view(request):
    permits = Permit.objects.filter(
        Q(timeline__isnull=True) | Q(timeline__status="Under review")
    ).distinct()
    district = _officer_district_name(request)
    if district:
        permits = permits.filter(project__property__property_district=district)
    return Response(FullPermitSerializer(permits, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def flagged_permits_list(request):
    """
    Returns all permits currently violating system criteria as serialized
    JSON data, scoped to the requesting officer's district if any.

    get_flagged_permits() returns a plain list of Permit instances (it
    can't be a queryset since flagging requires per-permit Python logic),
    so it goes through the serializer rather than JsonResponse/.values().
    """
    qs = Permit.objects.select_related("timeline", "supervisor", "project")
    district = _officer_district_name(request)
    if district:
        qs = qs.filter(project__property__property_district=district)
    flagged_permits = get_flagged_permits(qs)
    return Response(FullPermitSerializer(flagged_permits, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def trigger_permit_flag_check(request, permit_id):
    """
    Action endpoint to re-evaluate validation logic for a permit.
    Returns status confirmation messages via JSON instead of redirects or HTML.
    """
    permit = get_object_or_404(Permit, pk=permit_id)
    alert = insert_flagged_permit(permit)

    if alert:
        return JsonResponse({
            "status": "flagged",
            "message": f"Alert generated successfully for Permit #{permit_id}.",
            "alert_id": alert.alertId,
        }, status=201)

    return JsonResponse({
        "status": "passed",
        "message": f"Permit #{permit_id} does not violate constraints."
    }, status=200)



# PROJECTS


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_projects_view(request):
    projects = Project.objects.select_related("property__zoning").all()
    district = _officer_district_name(request)
    if district:
        projects = projects.filter(property__property_district=district)
    return Response(ProjectSerializer(projects, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_detail_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    return Response(ProjectDetailSerializer(project).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def flagged_projects_list(request):
    """
    Returns distinct projects containing flagged permits as a JSON payload.

    get_flagged_projects() returns a plain list of Project instances,
    same reasoning as flagged_permits_list — these need to go through
    ProjectSerializer before they're JSON-serializable.
    """
    flagged_projects = get_flagged_projects()
    return Response(ProjectSerializer(flagged_projects, many=True).data)



# APPLICANTS


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_applicants_view(request):
    applicants = Applicant.objects.all()
    district = _officer_district_name(request)
    if district:
        applicants = applicants.filter(
            permits__project__property__property_district=district
        ).distinct()
    return Response(ApplicantSerializer(applicants, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicant_detail_view(request, applicant_id):
    applicant = get_object_or_404(Applicant, pk=applicant_id)
    district = _officer_district_name(request)
    return Response(
        ApplicantDetailSerializer(applicant, context={"district": district}).data
    )



# ALERTS


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def alerts_list_view(request):
    alerts = Alert.objects.all()
    district = _officer_district_name(request)
    if district:
        alerts = alerts.filter(project__property__property_district=district)
    return Response(AlertSerializer(alerts, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def alert_detail_view(request, alert_id):
    alert = get_object_or_404(Alert, pk=alert_id)
    return Response(AlertSerializer(alert).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resolve_alert_view(request, alert_id):
    alert = get_object_or_404(Alert, pk=alert_id)
    valid_statuses = {choice[0] for choice in Alert.STATUS_CHOICES}
    new_status = request.data.get("status", "resolved")

    if new_status not in valid_statuses:
        return Response(
            {"detail": f"Invalid status. Must be one of: {', '.join(sorted(valid_statuses))}."},
            status=400,
        )

    note = (request.data.get("resolution_note") or "").strip()

    alert.alert_status = new_status
    alert.save()

    if note:
        AlertComment.objects.create(alert=alert, author=request.user, text=note)

    return Response(AlertSerializer(alert).data)



# OFFICERS / MONITORING


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assigned_officers_view(request):
    officers = User.objects.filter(
        user_role__role_name=Role.RoleNames.MONITORING_OFFICER,
        assigned_district__isnull=False,
    )
    return Response(OfficerSerializer(officers, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def unassigned_officers_view(request):
    officers = User.objects.filter(
        user_role__role_name=Role.RoleNames.MONITORING_OFFICER,
        assigned_district__isnull=True,
    )
    return Response(OfficerSerializer(officers, many=True).data)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def officer_detail_view(request, officer_id):
    officer = get_object_or_404(
        User, pk=officer_id, user_role__role_name=Role.RoleNames.MONITORING_OFFICER
    )
    if request.method == "PATCH":
        data = request.data
        if "name" in data:
            officer.user_name = data["name"]
        if "phone" in data:
            officer.user_phone = data["phone"]
        if "email" in data:
            officer.user_email = data["email"]
        officer.save()
    return Response(OfficerSerializer(officer).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_officer_view(request):
    data = request.data
    officer_role = Role.objects.get(role_name=Role.RoleNames.MONITORING_OFFICER)
    district = None
    if data.get("district"):
        district, _ = District.objects.get_or_create(name=data["district"])

    officer = User(
        user_email=data.get("email"),
        user_name=data.get("name"),
        user_phone=data.get("phone", ""),
        user_role=officer_role,
        user_status="active",
        assigned_district=district,
        username=data.get("email"),
    )
    # NOTE: the create-officer form doesn't collect a password. Using a
    # fixed temporary one for now — decide on a real flow (invite email +
    # set-password link, or admin-set password) before this goes anywhere near production.
    officer.set_password("ChangeMe123!")
    officer.save()
    return Response(OfficerSerializer(officer).data, status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_officer_view(request, officer_id):
    officer = get_object_or_404(
        User, pk=officer_id, user_role__role_name=Role.RoleNames.MONITORING_OFFICER
    )
    district, _ = District.objects.get_or_create(name=request.data.get("district"))
    officer.assigned_district = district
    officer.save()
    return Response(OfficerSerializer(officer).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unassign_officer_view(request, officer_id):
    officer = get_object_or_404(
        User, pk=officer_id, user_role__role_name=Role.RoleNames.MONITORING_OFFICER
    )
    officer.assigned_district = None
    officer.save()
    return Response(OfficerSerializer(officer).data)



# DISTRICTS


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def district_coverage_view(request):
    known_names = set(District.objects.values_list("name", flat=True))
    data_names = set(
        Property.objects.exclude(property_district="")
        .values_list("property_district", flat=True)
        .distinct()
    )
    all_names = sorted(known_names | data_names)

    data = []
    for name in all_names:
        district, _ = District.objects.get_or_create(name=name)
        officer = User.objects.filter(
            assigned_district=district, user_role__role_name=Role.RoleNames.MONITORING_OFFICER
        ).first()
        data.append({
            "district": name,
            "officer": OfficerSerializer(officer).data if officer else None,
        })
    return Response(data)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response(
            {"detail": "Both old_password and new_password are required."},
            status=400,
        )

    if not user.check_password(old_password):
        return Response({"detail": "Current password is incorrect."}, status=400)

    if len(new_password) < 8:
        return Response(
            {"detail": "New password must be at least 8 characters."}, status=400
        )

    user.set_password(new_password)
    user.save()
    return Response({"detail": "Password updated successfully."})
