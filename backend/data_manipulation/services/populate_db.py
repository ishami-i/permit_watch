"""
Database persistence layer for permit synchronization.

Responsible for creating and updating permits and all related records
(applicants, professionals, properties, zoning, projects, financial
data, supervisors, and timelines).

Each permit is processed inside its own database transaction to ensure
one malformed record does not affect the rest of the synchronization.
"""
import logging

from django.core.exceptions import ValidationError
from django.db import transaction

from ..models import (
    Applicant,
    FinancialData,
    Permit,
    Professional,
    Project,
    Property,
    Supervisor,
    Timeline,
    Zoning,
)

logger = logging.getLogger(__name__)

def _get_or_create_applicant(data):
    applicant, _ = Applicant.objects.update_or_create(
        national_id=data["national_id"],
        defaults={
            "applicant_name": data["full_name"],
            "applicant_email": data["contact_info"]["email_address"],
            "applicant_phone": data["contact_info"]["phone_number"],
        }
    )
    return applicant


def _get_or_create_professional(data, professional_type):
    # engineer/architect records use "license_number"; surveyor records use
    # "certification_number" - same slot, different key name upstream.
    license_number = data.get("license_number") or data.get("certification_number")

    professional, _ = Professional.objects.update_or_create(
        license_number=license_number,
        defaults={
            "professional_name": data["name"],
            "professional_type": professional_type,
        }
    )
    return professional


def _get_or_create_property(data):
    location = data["administrative_location"]
    coordinates = data["gis_coordinates"]
    zoning_data = data["zoning"]

    property_obj, _ = Property.objects.update_or_create(
        upi=data["upi"],
        defaults={
            "physical_address": data["physical_address"],
            "property_province": location["province"],
            "property_district": location["district"],
            "property_sector": location["sector"],
            "latitude": coordinates["latitude"],
            "longitude": coordinates["longitude"],
        }
    )

    Zoning.objects.update_or_create(
        property=property_obj,
        defaults={
            "environmental_protection_boundaries": zoning_data["environmental_protection_boundaries"],
            "land_use_zoning": zoning_data["land_use_classification"],
            "permitted_building_rights": zoning_data["permitted_building_rights"],
            "urban_planning_restrictions": zoning_data["urban_planning_restrictions"],
        }
    )

    return property_obj


def _get_or_create_project(data, property_obj):
    characteristics = data["building_characteristics"]
    financials = data["financial_data"]

    project, _ = Project.objects.update_or_create(
        projectId=data["project_id"],
        defaults={
            "building_purpose": characteristics["building_purpose"],
            "building_height": characteristics["building_height"],
            "gross_floor_area": characteristics["gross_floor_area"],
            "number_of_floors": characteristics["number_of_floors"],
            "property": property_obj,
        }
    )

    FinancialData.objects.update_or_create(
        project=project,
        defaults={
            "estimated_construction_cost": financials["estimated_construction_cost"],
            "contingency_10_percent": financials["contingency_10_percent"],
            "design_fee": financials["design_fee"],
            "inspection_fee": financials["inspection_fee"],
            "permit_fee": financials["permit_fee"],
            "survey_fee": financials["survey_fee"],
            "total_estimated_cost": financials["total_estimated_cost"],
            "currency": financials.get("currency", "RWF"),
        }
    )

    return project


def _get_or_create_supervisor(data):
    # a permit's district might not have an assigned supervisor yet
    if not data:
        return None

    supervisor, _ = Supervisor.objects.update_or_create(
        district=data["district"],
        defaults={
            "supervisor_name": data["full_name"],
            "supervisor_phone": data["phone_number"],
        }
    )
    return supervisor


def _insert_permit(permit_data):
    """
    Upserts a single permit record, plus everything it references, inside
    one transaction. Returns (permit, created).
    """
    with transaction.atomic():
        applicant = _get_or_create_applicant(permit_data["applicant"])

        professionals = permit_data["professional"]
        architect = _get_or_create_professional(
            professionals["architect"], Professional.ProfessionalType.ARCHITECT
        )
        engineer = _get_or_create_professional(
            professionals["engineer"], Professional.ProfessionalType.ENGINEER
        )
        surveyor = _get_or_create_professional(
            professionals["surveyor"], Professional.ProfessionalType.SURVEYOR
        )

        property_obj = _get_or_create_property(permit_data["property"])
        project = _get_or_create_project(permit_data["project"], property_obj)
        supervisor = _get_or_create_supervisor(permit_data.get("supervisor"))

        permit, created = Permit.objects.update_or_create(
            external_permit_id=permit_data["permit_id"],
            defaults={
                "applicant": applicant,
                "project": project,
                "architect": architect,
                "engineer": engineer,
                "surveyor": surveyor,
                "supervisor": supervisor,
            }
        )
        permit.full_clean()  # runs Permit.clean() - enforces architect/engineer/surveyor typing

        timeline_data = permit_data["timeline"]
        Timeline.objects.update_or_create(
            permit=permit,
            defaults={
                "submission_date": timeline_data["submission_date"],
                "response_date": timeline_data.get("response_date"),
                "resubmission_date": timeline_data.get("resubmission_date"),
                "permit_issuance_date": timeline_data.get("permit_issuance_date"),
                "permit_expiration_date": timeline_data.get("permit_expiration_date"),
                "review_duration": timeline_data.get("review_duration"),
                "status": timeline_data["status"],
            }
        )

    return permit, created


def populate_database(permits):
    """
    Persist permit data into the database.

    Args:
        permits (list): Validated permit dictionaries.

    Returns:
        dict
    """

    if not permits:
        logger.info("No permits received for import.")

        return {
            "created": 0,
            "updated": 0,
            "failed": 0,
        }

    created_count = 0
    updated_count = 0
    failed_count = 0

    for permit_data in permits:

        permit_id = permit_data.get("permit_id", "<unknown>")

        try:

            _, created = _insert_permit(permit_data)

            if created:
                created_count += 1
            else:
                updated_count += 1

        except (KeyError, ValidationError):

            logger.exception(
                "Failed importing permit %s",
                permit_id,
            )

            failed_count += 1

    logger.info(
        "Database import finished. %d created, %d updated, %d failed.",
        created_count,
        updated_count,
        failed_count,
    )

    return {
        "created": created_count,
        "updated": updated_count,
        "failed": failed_count,
    }