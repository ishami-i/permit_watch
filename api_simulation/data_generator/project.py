"""
generate_projects()
    Building Characteristics
        Building purpose (residential, commercial, industrial, etc.)
        Number of floors
        Building height
        Gross floor area

    Design Data
        Architectural drawings and schematics
        Structural plans
        Building Information Modeling (BIM) files
        Data for automated building-code compliance checks

    Financial Data
        Estimated construction cost
        Permit fees
        Inspection fees
"""
import random
import string


# Generate random file names for project documents
def generate_file_name(prefix, extension):
    token = "".join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=8
        )
    )

    return f"{prefix}_{token}.{extension}"


# Generate building permit projects
def generate_projects(num_projects):
    """
    Generate random building projects.

    Each project contains:
    - Building characteristics
    - Design documents
    - Financial data
    """

    building_purposes = [
        "residential",
        "commercial",
        "industrial",
        "mixed-use",
        "institutional"
    ]

    projects = []

    # Cost per square meter (RWF)
    purpose_base_rates = {
        "residential": 450_000,
        "commercial": 600_000,
        "industrial": 350_000,
        "mixed-use": 550_000,
        "institutional": 500_000
    }

    # Generate projects
    for i in range(num_projects):

        project_id = f"PRJ-{i + 1:05d}"

        building_purpose = random.choice(building_purposes)

        # ----------------------------------------------------
        # Generate building characteristics based on purpose
        # ----------------------------------------------------

        if building_purpose == "residential":
            number_of_floors = random.randint(1, 6)
            floor_height = 4.0
            gross_floor_area = round(
                random.uniform(50, 500),
                2
            )

        elif building_purpose == "commercial":
            number_of_floors = random.randint(1, 60)
            floor_height = 4.0
            gross_floor_area = round(
                random.uniform(100, 2_000),
                2
            )

        elif building_purpose == "industrial":
            number_of_floors = random.randint(1, 10)
            floor_height = 5.0
            gross_floor_area = round(
                random.uniform(200, 5_000),
                2
            )

        elif building_purpose == "mixed-use":
            number_of_floors = random.randint(1, 30)
            floor_height = 4.0
            gross_floor_area = round(
                random.uniform(100, 3_000),
                2
            )

        else:  # institutional
            number_of_floors = random.randint(1, 20)
            floor_height = 4.0
            gross_floor_area = round(
                random.uniform(100, 1_500),
                2
            )

        # Total building height
        building_height = round(
            number_of_floors * floor_height,
            2
        )

        # ----------------------------------------------------
        # Design files
        # ----------------------------------------------------

        design_data = {
            "architectural_drawings": generate_file_name(
                "architectural",
                "pdf"
            ),
            "structural_plans": generate_file_name(
                "structural",
                "pdf"
            ),
            "bim_file": generate_file_name(
                "bim",
                "ifc"
            ),
            "compliance_report": generate_file_name(
                "compliance",
                "json"
            )
        }

        # ----------------------------------------------------
        # Financial calculations
        # ----------------------------------------------------

        base_rate = purpose_base_rates[building_purpose]

        # Additional construction complexity
        if number_of_floors <= 1:
            floor_factor = 0.00

        elif number_of_floors == 2:
            floor_factor = 0.10

        elif number_of_floors == 3:
            floor_factor = 0.18

        elif number_of_floors == 4:
            floor_factor = 0.25

        else:
            floor_factor = (
                0.25 +
                ((number_of_floors - 4) * 0.03)
            )

        # Standard floor height in meters
        standard_height = number_of_floors * 3.5

        height_factor = 0

        # Increase cost if the building is taller
        if building_height > standard_height:
            height_factor = (
                building_height - standard_height
            ) * 0.05

        total_multiplier = (
            1 +
            floor_factor +
            height_factor
        )

        # Construction cost
        structural_cost = (
            gross_floor_area *
            base_rate *
            total_multiplier
        )

        # Fixed fees
        permit_fee = random.randint(
            300_000,
            1_000_000
        )

        inspection_fee = random.randint(
            100_000,
            500_000
        )

        design_fee = random.randint(
            2_000_000,
            5_000_000
        )

        survey_fee = random.randint(
            500_000,
            1_000_000
        )

        subtotal = (
            structural_cost +
            permit_fee +
            inspection_fee +
            design_fee +
            survey_fee
        )

        contingency = subtotal * 0.10

        total_estimated_cost = round(
            subtotal + contingency,
            2
        )

        financial_data = {
            "estimated_construction_cost": round(
                structural_cost,
                2
            ),
            "permit_fee": permit_fee,
            "inspection_fee": inspection_fee,
            "design_fee": design_fee,
            "survey_fee": survey_fee,
            "contingency_10_percent": round(
                contingency,
                2
            ),
            "total_estimated_cost": total_estimated_cost,
            "currency": "RWF"
        }

        # ----------------------------------------------------
        # Create project object
        # ----------------------------------------------------

        project = {
            "project_id": project_id,

            "building_characteristics": {
                "building_purpose": building_purpose,
                "number_of_floors": number_of_floors,
                "building_height": building_height,
                "gross_floor_area": gross_floor_area
            },

            "design_data": design_data,

            "financial_data": financial_data
        }

        projects.append(project)

    return projects

if __name__ == "__main__":

    projects = generate_projects(10)