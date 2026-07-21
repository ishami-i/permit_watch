from django.urls import path

from .views import (
    permit_data_view,
    all_permit_data_view,
    full_permit_data_view,
    all_full_permit_data_view,
)

urlpatterns = [
    path(
        "permits/",
        all_permit_data_view,
        name="permits",
    ),

    path(
        "permits/full/",
        all_full_permit_data_view,
        name="full_permits",
    ),

    path(
        "permits/<int:permit_id>/",
        permit_data_view,
        name="permit",
    ),

    path(
        "permits/full/<int:permit_id>/",
        full_permit_data_view,
        name="full_permit",
    ),
]