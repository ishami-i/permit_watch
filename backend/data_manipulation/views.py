from django.contrib import messages
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404

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


# ==========================================
# JSON API Endpoints (Data Management)
# ==========================================

def permit_data_view(request, permit_id):
    """
    Fetches a single permit and returns its basic serialized JSON payload.
    """
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    
    return get_permit_data(permit)


def all_permit_data_view(request):
    """
    Returns an aggregated list of all basic serialized permits in JSON format.
    """
    return get_all_permits()


def full_permit_data_view(request, permit_id):
    """
    Fetches a single permit with all extended relational dependencies in JSON format.
    """
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    
    return get_full_permit_data(permit)


def all_full_permit_data_view(request):
    """
    Returns an aggregated list of all full permits along with related object histories.
    """
    return get_all_full_permits()


# ==========================================
# API Operations & Flagging Endpoints
# ==========================================

def flagged_permits_list(request):
    """
    Returns all permits currently violating system criteria as serialized JSON data.
    """
    flagged_permits = get_flagged_permits()
    # If your service returns models, serialize them; if it returns JsonResponse, return directly.
    if isinstance(flagged_permits, JsonResponse):
        return flagged_permits
        
    return JsonResponse({"flagged_permits": list(flagged_permits.values())})


def flagged_projects_list(request):
    """
    Returns distinct projects containing flagged items as a JSON payload.
    """
    flagged_projects = get_flagged_projects()
    if isinstance(flagged_projects, JsonResponse):
        return flagged_projects
        
    return JsonResponse(
        {"flagged_projects": flagged_projects},
        safe=True
    )


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
            "alert_id": alert.id
        }, status=201)
        
    return JsonResponse({
        "status": "passed",
        "message": f"Permit #{permit_id} does not violate constraints."
    }, status=200)