"""generate_permits()
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

def generate_permits(num_permits):

    properties = generate_properties(num_permits)
    professionals = generate_professionals(num_permits)
    applicants = generate_applicants(num_permits)
    projects = generate_projects(num_permits)

    permits = []

    statuses = [
        "Under review",
        "Approved",
        "Rejected",
        "Resubmitted"
    ]

    for i in range(num_permits):

        submission_date = (
            datetime.datetime.now()
            - datetime.timedelta(
                days=random.randint(1, 60)
            )
        )

        status = random.choice(statuses)

        response_date = None
        resubmission_date = None
        permit_issuance_date = None
        permit_expiration_date = None
        review_duration = None

        if status == "Approved":

            permit_issuance_date = (
                submission_date
                + datetime.timedelta(
                    days=random.randint(1, 60)
                )
            )

            response_date = permit_issuance_date

            permit_expiration_date = (
                permit_issuance_date
                + datetime.timedelta(days=730)
            )

            review_duration = (
                response_date - submission_date
            ).days

        elif status == "Rejected":

            response_date = (
                submission_date
                + datetime.timedelta(
                    days=random.randint(1, 60)
                )
            )

            review_duration = (
                response_date - submission_date
            ).days

        elif status == "Resubmitted":

            resubmission_date = (
                submission_date
                + datetime.timedelta(
                    days=random.randint(1, 30)
                )
            )

            response_date = (
                resubmission_date
                + datetime.timedelta(
                    days=random.randint(1, 60)
                )
            )

            review_duration = (
                response_date - resubmission_date
            ).days

            status = random.choice([
                "Approved",
                "Rejected"
            ])

            if status == "Approved":

                permit_issuance_date = response_date

                permit_expiration_date = (
                    permit_issuance_date
                    + datetime.timedelta(days=730)
                )

        else:

            review_duration = (
                datetime.datetime.now()
                - submission_date
            ).days

        permit = {

            "permit_id": f"PERMIT-{i + 1:05d}",

            "timeline": {

                "submission_date":
                    submission_date.strftime("%Y-%m-%d"),

                "resubmission_date":
                    resubmission_date.strftime("%Y-%m-%d")
                    if resubmission_date else None,

                "response_date":
                    response_date.strftime("%Y-%m-%d")
                    if response_date else None,

                "permit_issuance_date":
                    permit_issuance_date.strftime("%Y-%m-%d")
                    if permit_issuance_date else None,

                "permit_expiration_date":
                    permit_expiration_date.strftime("%Y-%m-%d")
                    if permit_expiration_date else None,

                "status":
                    status,

                "review_duration":
                    review_duration
            },

            "applicant": applicants[i],
            "professional": professionals[i],
            "property": properties[i],
            "project": projects[i]
        }

        permits.append(permit)

    return permits

if __name__ == "__main__":
    
    permits = generate_permits(10)
    for permit in permits:
        print(
            json.dumps(
                permit,
                indent=4,
                ensure_ascii=False
            )
        )
        print("-" * 80)