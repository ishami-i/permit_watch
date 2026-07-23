"""
Permit data service layer.

This module provides helper functions for serializing permit information
and returning it as JSON responses for the frontend dashboard.
"""

from django.http import JsonResponse
from data_manipulation import serializer
from data_manipulation.models import Permit


def get_permit_data(permit):
    """
    Serialize a single permit instance and return its data as JSON.

    Args:
        permit: A Permit model instance.

    Returns:
        JsonResponse containing serialized permit data.
    """

    serialized_permit = serializer.PermitSerializer(permit)

    return JsonResponse(
        serialized_permit.data,
        safe=False,
        status=200,
    )


def get_full_permit_data(permit):
    """
    Serialize a single permit instance together with all related objects.

    Related objects include:

        - Applicant
        - Project
        - Architect
        - Engineer
        - Surveyor
        - Supervisor

    Args:
        permit: A Permit model instance.

    Returns:
        JsonResponse containing fully serialized permit data.
    """

    serialized_permit = serializer.FullPermitSerializer(permit)

    return JsonResponse(
        serialized_permit.data,
        safe=False,
        status=200,
    )


def get_all_permits():
    """
    Retrieve all permits from the database and return them as JSON.

    Returns:
        JsonResponse containing all permits.
    """

    permits = (
    Permit.objects
    .select_related(
        "timeline",
        "applicant",
        "project",
        "project__property",
        "project__financial_data",
        "project__property__zoning",
        "architect",
        "engineer",
        "surveyor",
        "supervisor",
    )
)

    serialized_permits = serializer.PermitSerializer(
        permits,
        many=True
    )

    return JsonResponse(
        serialized_permits.data,
        safe=False,
        status=200,
    )


def get_all_full_permits():
    """
    Retrieve all permits in the database along with their related objects and return them as JSON.

    Returns:
        JsonResponse containing all permits with applicants,
        projects, architects, engineers, surveyors, and supervisors.
    """

    permits = (
    Permit.objects
    .select_related(
        "timeline",
        "applicant",
        "project",
        "project__property",
        "project__financial_data",
        "project__property__zoning",
        "architect",
        "engineer",
        "surveyor",
        "supervisor",
    )
)

    serialized_permits = serializer.FullPermitSerializer(
        permits,
        many=True
    )

    return JsonResponse(
        serialized_permits.data,
        safe=False,
        status=200,
    )