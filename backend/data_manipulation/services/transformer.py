"""
Transforms and validates permit data received from the Permit API.

This module should NOT interact with the database.
Its only responsibility is to ensure that every permit has the
required structure before it is passed to populate_db.py.
"""

import logging
from copy import deepcopy
from datetime import datetime

logger = logging.getLogger(__name__)

# required top level keys for a permit record
REQUIRED_KEYS = {
    "permit_id",
    "applicant",
    "project",
    "property",
    "professional",
    "supervisor",
    "timeline",
}

# validation helpers 

def validate_permit(permit: dict):
    """
    Validate a permit payload.

    Raises:
        ValueError if required data is missing.
    """

    missing = [field for field in REQUIRED_KEYS if field not in permit]

    if missing:
        raise ValueError(
            f"Missing required fields: {', '.join(missing)}"
        )
    
def ensure_nested_key(parent: dict, key: str):
    """
    Ensure that a nested key exists...
    If the key is missing, it will be created as an empty dictionary.
    """
    if key not in parent:
        raise ValueError(
            f"Missing Key: {key} in {parent}"
        )
    
# date helpers 
def normalize_date(value):
    """
    Convert empty values to None.

    Future enhancement:
        Convert string dates into Python date objects.
    """

    if value in ("", None):
        return None
    return value

# financial data helpers
def normalize_currency(financial_data):
    """"
    Ensure every financial record has a currency
    """
    financial_data.setdefault("currency", "RWF")
    
    return financial_data

# timeline helpers
def normalize_timeline(timeline):
    """
    Normalize timeline dates.
    """
    timeline["submission_date"] = normalize_date(
        timeline.get("submission_date")
    )
    timeline["response_date"] = normalize_date(
        timeline.get("response_date")
    )
    timeline["resubmission_date"] = normalize_date(
        timeline.get("resubmission_date")
    )
    timeline["permit_issuance_date"] = normalize_date(
        timeline.get("permit_issuance_date")
    )
    timeline["permit_expiration_date"] = normalize_date(
        timeline.get("permit_expiration_date")
    )

    return timeline

# main Transformation

def transform_permit(permit):
    """
    validate and normalize a single permit record.
    """

    validate_permit(permit)
    permit = deepcopy(permit)  # avoid mutating the original data

    # applicant
    applicant = permit["applicant"]
    ensure_nested_key(applicant, "national_id")
    ensure_nested_key(applicant, "full_name")
    ensure_nested_key(applicant, "contact_info")

    # professionals
    professionals = permit["professional"]
    ensure_nested_key(professionals, "architect")
    ensure_nested_key(professionals, "engineer")
    ensure_nested_key(professionals, "surveyor")

    # property
    property_data = permit["property"]
    ensure_nested_key(property_data, "upi")
    ensure_nested_key(property_data, "administrative_location")
    ensure_nested_key(property_data, "gis_coordinates")
    ensure_nested_key(property_data, "zoning")

    # project
    project_data = permit["project"]
    ensure_nested_key(project_data, "project_id")
    ensure_nested_key(project_data, "building_characteristics")
    ensure_nested_key(project_data, "financial_data")

    project_data["financial_data"] = normalize_currency(
        project_data["financial_data"]
    )

    # timeline
    permit["timeline"] = normalize_timeline(
        permit["timeline"]
        )
    return permit

# batch transformation
def transform_permits(permits):
    """
    Transform every permit returned by the API.

    Invalid permits are skipped instead of stopping the import.
    """
    cleaned = []

    skipped = 0

    for permit in permits:
        permit_id = permit.get("permit_id", "unknown")
        try:
            cleaned.append(
                transform_permit(permit)
            )
        except Exception:
            skipped += 1
            
            logger.exception(
                "skipping malformed permit %s",
                permit_id,
            )
    logger.info(
        "Validated %d permits (%d skipped).",
        len(cleaned),
        skipped
    )
    return cleaned