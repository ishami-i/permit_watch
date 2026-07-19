"""
generate_projects()
    Building Characteristics
        Building purpose (residential, commercial, industrial, etc.)
        Number of floors
        Building height
        Gross floor area

    Financial Data
        Estimated construction cost
        Permit fees
        Inspection fees
"""
import random

_BUILDING_PURPOSES = ["residential", "commercial", "industrial", "mixed-use", "institutional"]

# Cost per square meter (RWF)
_PURPOSE_BASE_RATES = {
    "residential": 450_000,
    "commercial": 600_000,
    "industrial": 350_000,
    "mixed-use": 550_000,
    "institutional": 500_000
}

# (min_floors, max_floors, floor_height_m, min_area_m2, max_area_m2) per building purpose
_PURPOSE_PROFILES = {
    "residential": (1, 6, 4.0, 50, 500),
    "commercial": (1, 60, 4.0, 100, 2_000),
    "industrial": (1, 10, 5.0, 200, 5_000),
    "mixed-use": (1, 30, 4.0, 100, 3_000),
    "institutional": (1, 20, 4.0, 100, 1_500)
}


def _floor_factor(number_of_floors):
    """Extra construction-complexity multiplier driven by floor count."""
    if number_of_floors <= 1:
        return 0.00
    if number_of_floors == 2:
        return 0.10
    if number_of_floors == 3:
        return 0.18
    if number_of_floors == 4:
        return 0.25
    return 0.25 + ((number_of_floors - 4) * 0.03)


def generate_projects(num_projects):
    """
    Generate `num_projects` random building projects, each with building
    characteristics and an associated financial breakdown.
    """
    projects = []

    for i in range(num_projects):
        project_id = f"PRJ-{i + 1:05d}"
        building_purpose = random.choice(_BUILDING_PURPOSES)

        min_floors, max_floors, floor_height, min_area, max_area = _PURPOSE_PROFILES[building_purpose]
        number_of_floors = random.randint(min_floors, max_floors)
        gross_floor_area = round(random.uniform(min_area, max_area), 2)
        building_height = round(number_of_floors * floor_height, 2)

        # Financial calculations 
        
        base_rate = _PURPOSE_BASE_RATES[building_purpose]
        floor_factor = _floor_factor(number_of_floors)

        # Standard floor height assumption used only to detect unusually tall builds
        standard_height = number_of_floors * 3.5
        height_factor = 0
        if building_height > standard_height:
            height_factor = (building_height - standard_height) * 0.05

        total_multiplier = 1 + floor_factor + height_factor
        structural_cost = gross_floor_area * base_rate * total_multiplier

        permit_fee = random.randint(300_000, 1_000_000)
        inspection_fee = random.randint(100_000, 500_000)
        design_fee = random.randint(2_000_000, 5_000_000)
        survey_fee = random.randint(500_000, 1_000_000)

        subtotal = structural_cost + permit_fee + inspection_fee + design_fee + survey_fee
        contingency = subtotal * 0.10
        total_estimated_cost = round(subtotal + contingency, 2)

        financial_data = {
            "estimated_construction_cost": round(structural_cost, 2),
            "permit_fee": permit_fee,
            "inspection_fee": inspection_fee,
            "design_fee": design_fee,
            "survey_fee": survey_fee,
            "contingency_10_percent": round(contingency, 2),
            "total_estimated_cost": total_estimated_cost,
            "currency": "RWF"
        }

        project = {
            "project_id": project_id,
            "building_characteristics": {
                "building_purpose": building_purpose,
                "number_of_floors": number_of_floors,
                "building_height": building_height,
                "gross_floor_area": gross_floor_area
            },
            "financial_data": financial_data
        }

        projects.append(project)

    return projects


if __name__ == "__main__":
    for generated_project in generate_projects(10):
        print(generated_project)