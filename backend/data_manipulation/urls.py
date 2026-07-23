from django.urls import path
from . import views

urlpatterns = [
    path(
        "permits/",
        views.all_permit_data_view,
        name="permits",
    ),
    path(
        "permits/full/",
        views.all_full_permit_data_view,
        name="full_permits",
    ),
    path(
        "permits/<int:permit_id>/",
        views.permit_data_view,
        name="permit",
    ),
    path(
        "permits/full/<int:permit_id>/",
        views.full_permit_data_view,
        name="full_permit",
    ),
    path(
        "permits/flagged/", 
        views.flagged_permits_list, 
        name="flagged_permits_list"
    ),
    path(
        "projects/flagged/", 
        views.flagged_projects_list, 
        name="flagged_projects_list"
    ),
    path(
        "permits/<int:permit_id>/check/", 
        views.trigger_permit_flag_check, 
        name="check_permit"
    ),
]
