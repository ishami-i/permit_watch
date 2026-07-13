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

# function to generate random project data
def generate_projects(num_projects):
    building_purposes = ["residential", "commercial", "industrial", "mixed-use", "institutional"]
    project = []

    for _ in range(num_projects):
        building_purpose = random.choice(building_purposes)
        if building_purpose == "residential":
            number_of_floors = random.randint(1, 6)
            building_height = round(random.uniform(6.0, 36.0), 2)  # in meters
            gross_floor_area = round(random.uniform(50.0, 500.0), 2)  # in square meters
        elif building_purpose == "commercial":
            number_of_floors = random.randint(1, 60)
            building_height = round(random.uniform(6.0, 240.0), 2)  # in meters
            gross_floor_area = round(random.uniform(100.0, 2000.0), 2)  # in square meters
        elif building_purpose == "industrial":
            number_of_floors = random.randint(1, 10)
            building_height = round(random.uniform(6.0, 60.0), 2)  # in meters
            gross_floor_area = round(random.uniform(200.0, 5000.0), 2)  # in square meters
        elif building_purpose == "mixed-use":
            number_of_floors = random.randint(1, 30)
            building_height = round(random.uniform(6.0, 120.0), 2)  # in meters
            gross_floor_area = round(random.uniform(100.0, 3000.0), 2)  # in square meters
        else:  # institutional
            number_of_floors = random.randint(1, 20)
            building_height = round(random.uniform(6.0, 80.0), 2)  # in meters
            gross_floor_area = round(random.uniform(100.0, 1500.0), 2)  # in square meters


            building_characteristics = {
                "building_purpose": building_purpose,
                "number_of_floors": number_of_floors,
                "building_height": building_height,
                "gross_floor_area": gross_floor_area
            }

            project.append(building_characteristics)