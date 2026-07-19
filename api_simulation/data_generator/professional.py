"""
generate_professionals()
    Engineer name
    Architect name
    Surveyor name
    Engineer license number
        Format: [SerialBlock][SequenceNumber]/[Discipline Code]/[Board Acronym]/[Registration Year]
        Example: A2121/EC/IER/2024 (A=serial block, EC=Engineering/Consulting,
                 IER=Institute of Engineering Rwanda, 2024=registration year)
    Architect license number
        Format: [SerialBlock][SequenceNumber]/[Board Acronym]/[Registration Year]
        Example: A034/RIA/2023 (A=architect prefix, RIA=Rwanda Institute of Architects,
                 2023=initial registration year)
    Surveyor certification number
        Format: [ProfessionCode][SequenceNumber]
        Example: LS00377 (LS=Land Surveyor, 00377=chronological sequence number)
    Verification records from professional regulatory boards
"""
import random
import json
import datetime
from pathlib import Path

# Root directory containing sample data
_ROOT_DIR = Path(__file__).resolve().parent.parent
_NAMES_FILE = _ROOT_DIR / "sample_data" / "names.json"

with open(_NAMES_FILE, "r", encoding="utf-8") as _file:
    _NAMES = json.load(_file)["names"]

def generate_engineer_license(
    serial_block: str = "A",
    sequence_number: int = None,
    discipline_code: str = "EC",
    board_acronym: str = "IER",
    registration_year: int = None
) -> str:
    """
    Generates an Engineer license number.
    Format: [SerialBlock][SequenceNumber]/[Discipline Code]/[Board Acronym]/[Registration Year]
    Example output: A2121/EC/IER/2024

    NOTE: sequence_number and registration_year are generated fresh on every
    call (default is None, resolved inside the function body) rather than
    baked into the signature - a mutable/random default evaluated at def
    time would otherwise return the same "random" value on every call.
    """
    if sequence_number is None:
        sequence_number = random.randint(1000, 9999)
    if registration_year is None:
        registration_year = random.randint(2000, datetime.datetime.now().year)

    return f"{serial_block}{sequence_number}/{discipline_code}/{board_acronym}/{registration_year}"


def generate_architect_license(
    serial_block: str = "A",
    sequence_number: int = None,
    board_acronym: str = "RIA",
    registration_year: int = None
) -> str:
    """
    Generates an Architect license number.
    Format: [SerialBlock][SequenceNumber]/[Board Acronym]/[Registration Year]
    Example output: A034/RIA/2023
    """
    if sequence_number is None:
        sequence_number = random.randint(1, 999)
    if registration_year is None:
        registration_year = random.randint(2000, datetime.datetime.now().year)

    return f"{serial_block}{sequence_number:03d}/{board_acronym}/{registration_year}"


def generate_surveyor_certification(
    profession_code: str = "LS",
    sequence_number: int = None,
    padding: int = 5
) -> str:
    """
    Generates a Surveyor certification number.
    Format: [ProfessionCode][SequenceNumber]
    Example output: LS00377
    """
    if sequence_number is None:
        sequence_number = random.randint(1, 99999)

    return f"{profession_code}{str(sequence_number).zfill(padding)}"

def generate_professionals(num_professionals):
    """
    Generate `num_professionals` records, each pairing a random engineer,
    architect, and surveyor (names drawn from the sample names list) with
    freshly generated license/certification numbers.
    """
    professionals = []
    for _ in range(num_professionals):
        professional = {
            "engineer": {
                "name": random.choice(_NAMES),
                "license_number": generate_engineer_license()
            },
            "architect": {
                "name": random.choice(_NAMES),
                "license_number": generate_architect_license()
            },
            "surveyor": {
                "name": random.choice(_NAMES),
                "certification_number": generate_surveyor_certification()
            }
        }
        professionals.append(professional)
    return professionals


if __name__ == "__main__":
    for generated_professional in generate_professionals(10):
        print(generated_professional)