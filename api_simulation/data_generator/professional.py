"""
generate_professionals()
    Engineer name
    Architect name
    Surveyor name
    Engineer license number
        Format Structure: [Sequence Number]/[Discipline/Category Code]/[Board Acronym]/[Registration Year]
        Example: A2121/EC/IER/2024 (where 'A' is the serial block, 'EC' denotes Engineering/Consulting, 'IER' stands for Institute of Engineering Rwanda, and '2024' is the registration year)
    Architect license number
        Format Structure: [Sequence Number]/[Board Acronym] or simply a sequential number.
        Example: A034/RIA/2023 (where 'A' indicates Architect, 'RIA' stands for the Rwanda Institute of Architects, and '2023' is the initial year of registration).
    Surveyor certification number
        Format Structure: [Profession Code][Sequence Number]
        Example: LS00377 (where 'LS' designates Land Surveyor and '00377' is the registrant's chronological sequence number).
    Verification records from professional regulatory boards
"""
import random
import string
import json
import datetime
import pathlib as Path


# find root directory containing sample data
root_dir = Path.Path(__file__).resolve().parent.parent

# define the file path 
file_path = root_dir / 'sample_data' / 'names.json'

# open and load the names from the json file
with open(file_path, 'r') as file:
    names_list = json.load(file)

# function for engineer license number generation
def generate_engineer_license(
    serial_block: str = "A",
    sequence_number: int = random.randint(1000, 9999),
    discipline_code: str = "EC",
    board_acronym: str = "IER",
    registration_year: int = random.randint(2000, datetime.datetime.now().year)
) -> str:
    """
    Generates an Engineer license number matching the exact pattern.
    Format: [SerialBlock][SequenceNumber]/[Discipline/Category Code]/[Board Acronym]/[Registration Year]
    Example output: A2121/EC/IER/2024
    """
    Engineer_licence = f"{serial_block}{sequence_number}/{discipline_code}/{board_acronym}/{registration_year}"
    return Engineer_licence

# license number generation for architect
def generate_architect_license(
    serial_block: str = "A",
    sequence_number: int = random.randint(10, 99),
    registration_year: int = random.randint(2000, datetime.datetime.now().year)
) -> str:
    """
    Generates an Architect license number matching the exact pattern.
    Format: [SerialBlock][SequenceNumber]/[Registration Year]
    Example output: A034.23
    """
    # output the last two digits of the registration year
    registration_year = str(registration_year)[-2:]
    Architect_licence = f"{serial_block}.{sequence_number}.{registration_year}"
    return Architect_licence


# genarate surveyor certification number
def generate_surveyor_certification(
        profession_code: str = "LS",
        Sequence_code: int = random.randint(1, 99999),
        padding: str = "5"
) -> str:
    """
    Generates a Surveyor certification number matching the exact pattern.
    Format: [Profession Code][Sequence Number]
    Example output: LS00377
    """
    # pad the sequence number with leading zeros to ensure it is 5 digits long
    Sequence_code = str(Sequence_code).zfill(int(padding))
    Surveyor_certification = f"{profession_code}{Sequence_code}"
    return Surveyor_certification

# Function to generate a data but names is not random, it is from a list of names
def generate_professionals(num_professionals):
    engineer_names = names_list['names']
    architect_names = names_list['names']
    surveyor_names = names_list['names']
    professionals = []
    for _ in range(num_professionals):
        engineer_name = random.choice(engineer_names)
        architect_name = random.choice(architect_names)
        surveyor_name = random.choice(surveyor_names)

        engineer_license_number = generate_engineer_license()
        architect_license_number = generate_architect_license()
        surveyor_certification_number = generate_surveyor_certification()

        professional = {
            "engineer": {
                "name": engineer_name,
                "license_number": engineer_license_number
            },
            "architect": {
                "name": architect_name,
                "license_number": architect_license_number
            },
            "surveyor": {
                "name": surveyor_name,
                "certification_number": surveyor_certification_number
            }
        }
        professionals.append(professional)
    return professionals

if __name__ == "__main__":
    # Generate 10 random professionals and print them
    generated_professionals = generate_professionals(10)
    for professional in generated_professionals:
        print(professional)