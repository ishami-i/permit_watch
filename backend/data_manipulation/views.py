from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# Import models cleanly from the core application package
from data_manipulation.models import Permit

# Import unified business logic service functions
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
from data_manipulation.serializer import PermitSerializer, ProjectSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from django.db.models import Count
from django.contrib.auth import get_user_model
from data_manipulation.models import Alert, Applicant, Project, District, Role
from django.db.models import Q
from data_manipulation.models import Applicant, Alert, Project
from data_manipulation.serializer import (
    ApplicantSerializer, ApplicantDetailSerializer,
    ProjectDetailSerializer, AlertSerializer, FullPermitSerializer,
)



User = get_user_model()

# JSON API Endpoints (Data Management)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def permit_data_view(request, permit_id):
    """
    Fetches a single permit and returns its basic serialized JSON payload.
    """
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)

    return get_permit_data(permit)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_permit_data_view(request):
    """
    Returns an aggregated list of all basic serialized permits in JSON format.
    """
    return get_all_permits()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def full_permit_data_view(request, permit_id):
    """
    Fetches a single permit with all extended relational dependencies in JSON format.
    """
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)

    return get_full_permit_data(permit)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_full_permit_data_view(request):
    """
    Returns an aggregated list of all full permits along with related object histories.
    """
    return get_all_full_permits()

# API Operations & Flagging Endpoints
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def flagged_permits_list(request):
    """
    Returns all permits currently violating system criteria as serialized JSON data.

    get_flagged_permits() returns a plain list of Permit instances (it can't
    be a queryset since flagging requires per-permit Python logic), so it
    needs to go through the serializer rather than JsonResponse/.values().
    """
    flagged_permits = get_flagged_permits()

    serialized = PermitSerializer(flagged_permits, many=True)

    return JsonResponse({"flagged_permits": serialized.data})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def flagged_projects_list(request):
    """
    Returns distinct projects containing flagged permits as a JSON payload.

    get_flagged_projects() returns a plain list of Project instances, same
    reasoning as above - these need to go through ProjectSerializer before
    they're JSON-serializable.
    """
    flagged_projects = get_flagged_projects()

    serialized = ProjectSerializer(flagged_projects, many=True)

    return JsonResponse({"flagged_projects": serialized.data})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_projects_view(request):
    projects = Project.objects.select_related("property__zoning").all()
    return Response(ProjectSerializer(projects, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def trigger_permit_flag_check(request, permit_id):
    """
    Action endpoint to re-evaluate validation logic for a permit.
    Returns status confirmation messages via JSON instead of redirects or HTML.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed. Use POST."}, status=405)

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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    user = request.user
    return Response({
        "id": user.id,
        "name": user.user_name,
        "email": user.user_email,
        "role": user.user_role.role_name if user.user_role else None,
        "district": user.assigned_district.name if user.assigned_district else None,
    })

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
        "monthly_trend": [],   # needs a date field on Permit - see note above
        "alerts_by_severity": [
            {"severity": row["alert_severity"], "value": row["value"]}
            for row in alerts_by_severity
        ],
        "officer_workload": [
            {"officer": o.user_name, "permits": 0}  # placeholder — see note below
            for o in officers
        ],
        "recent_permits": [],  # needs a date field to order by "recent"
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_applicants_view(request):
    applicants = Applicant.objects.all()
    return Response(ApplicantSerializer(applicants, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def applicant_detail_view(request, applicant_id):
    applicant = get_object_or_404(Applicant, pk=applicant_id)
    return Response(ApplicantDetailSerializer(applicant).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_detail_view(request, project_id):
    project = get_object_or_404(Project, pk=project_id)
    return Response(ProjectDetailSerializer(project).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_permit_data_view(request):
    permits = Permit.objects.filter(
        Q(timeline__isnull=True) | Q(timeline__status="Under review")
    ).distinct()
    return Response(FullPermitSerializer(permits, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def alerts_list_view(request):
    alerts = Alert.objects.all()
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
    alert.alert_status = "resolved"
    alert.save()
    # Note: resolution_note isn't persisted — no field/model exists for it yet.
    return Response(AlertSerializer(alert).data)