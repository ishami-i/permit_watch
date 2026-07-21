from django.http import JsonResponse
from data_manipulation.services.get_permit import (
    get_permit_data,
    get_full_permit_data,
    get_all_permits,
    get_all_full_permits,
)
# create a view that gets the permit data from the database and returns in json format
def permit_data_view(request, permit_id):
    """
    this view takes a permit id and returns the serialized data in json format.
    """
    from data_manipulation.models import Permit
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    
    return get_permit_data(permit)

# create a view that gets all the permit data from the database and returns in json format
def all_permit_data_view(request):
    """
    this view returns all the serialized permit data in json format.
    """
    from data_manipulation.services.get_permit import get_all_permits
    return get_all_permits()

# create a view for gull permit data 
def full_permit_data_view(request, permit_id):
    """
    this view takes a permit id and returns the serialized data in json format.
    """
    from data_manipulation.models import Permit
    try:
        permit = Permit.objects.get(pk=permit_id)
    except Permit.DoesNotExist:
        return JsonResponse({"error": "Permit not found"}, status=404)
    
    return get_full_permit_data(permit)

def all_full_permit_data_view(request):
    """
    Return all permits together with their related objects.
    """

    return get_all_full_permits()