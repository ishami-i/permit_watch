"""
generate_permits()
    Status Tracking
        Under review
        Approved
        Rejected
        Resubmitted

    Timeline Metrics
        Submission date
        Review duration
        Approval date
        Permit issuance date
        Permit expiration date
"""
import random
import json
import datetime

from data_generator.property import generate_properties
from data_generator.professional import generate_professionals
from data_generator.applicant import generate_applicants
from data_generator.project import generate_projects
from data_generator.supervisor import assign_supervisor

_STATUSES = ["Under review", "Approved", "Rejected", "Resubmitted"]

_PERMIT_VALIDITY_DAYS = 730


def _build_timeline(submission_date):
    """
    Randomly walks a permit through a status/timeline, returning the
    dict of timeline fields plus the final status.
    """
    status = random.choice(_STATUSES)

    response_date = None
    resubmission_date = None
    permit_issuance_date = None
    permit_expiration_date = None
    review_duration = None

    if status == "Approved":
        permit_issuance_date = submission_date + datetime.timedelta(days=random.randint(1, 60))
        response_date = permit_issuance_date
        permit_expiration_date = permit_issuance_date + datetime.timedelta(days=_PERMIT_VALIDITY_DAYS)
        review_duration = (response_date - submission_date).days

    elif status == "Rejected":
        response_date = submission_date + datetime.timedelta(days=random.randint(1, 60))
        review_duration = (response_date - submission_date).days

    elif status == "Resubmitted":
        resubmission_date = submission_date + datetime.timedelta(days=random.randint(1, 30))
        response_date = resubmission_date + datetime.timedelta(days=random.randint(1, 60))
        review_duration = (response_date - resubmission_date).days

        # A resubmission is always eventually approved or rejected
        status = random.choice(["Approved", "Rejected"])
        if status == "Approved":
            permit_issuance_date = response_date
            permit_expiration_date = permit_issuance_date + datetime.timedelta(days=_PERMIT_VALIDITY_DAYS)

    else:  # Under review
        review_duration = (datetime.datetime.now() - submission_date).days

    return {
        "submission_date": submission_date.strftime("%Y-%m-%d"),
        "resubmission_date": resubmission_date.strftime("%Y-%m-%d") if resubmission_date else None,
        "response_date": response_date.strftime("%Y-%m-%d") if response_date else None,
        "permit_issuance_date": permit_issuance_date.strftime("%Y-%m-%d") if permit_issuance_date else None,
        "permit_expiration_date": permit_expiration_date.strftime("%Y-%m-%d") if permit_expiration_date else None,
        "status": status,
        "review_duration": review_duration
    }


def generate_permits(num_permits):
    """
    Generate `num_permits` full permit records, each combining a property,
    professional team, applicant, project, timeline/status, and the
    supervisor assigned to that property's district.
    """
    properties = generate_properties(num_permits)
    professionals = generate_professionals(num_permits)
    applicants = generate_applicants(num_permits)
    projects = generate_projects(num_permits)

    permits = []

    for i in range(num_permits):
        submission_date = datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 60))
        timeline = _build_timeline(submission_date)

        district = properties[i]["administrative_location"]["district"]

        permit = {
            "permit_id": f"PERMIT-{i + 1:05d}",
            "timeline": timeline,
            "applicant": applicants[i],
            "professional": professionals[i],
            "property": properties[i],
            "project": projects[i],
            "supervisor": assign_supervisor(district)
        }

        permits.append(permit)

    return permits


if __name__ == "__main__":
    for generated_permit in generate_permits(10):
        print(json.dumps(generated_permit, indent=4, ensure_ascii=False))
        print("-" * 80)