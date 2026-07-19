"""
Generates random applicant data for testing purposes.

generate_applicants()
    Full name
    National ID or passport number
    Contact information (phone number, email address)
"""
import random
import string
import json
from pathlib import Path

# Root directory containing sample data
_ROOT_DIR = Path(__file__).resolve().parent.parent
_NAMES_FILE = _ROOT_DIR / "sample_data" / "names.json"

with open(_NAMES_FILE, "r", encoding="utf-8") as _file:
    _NAMES = json.load(_file)["names"]


def _generate_national_id():
    """
    Builds a 16-digit Rwandan-style national ID:
    [category][birth year][gender digit][10 random digits]
    """
    category = "1"
    birth_year = random.randint(1930, 2015)
    gender_digit = random.choice(["7", "8"])
    trailing_digits = "".join(random.choices(string.digits, k=10))
    return f"{category}{birth_year}{gender_digit}{trailing_digits}"


def _generate_phone_number():
    return "+250" + "".join(random.choices(string.digits, k=9))


def _generate_email(full_name):
    local_part = full_name.lower().replace(" ", ".")
    return f"{local_part}{random.randint(1, 100)}@gmail.com"


def generate_applicants(num_applicants):
    """
    Generate `num_applicants` random applicant records, each with a name
    drawn from the sample names list plus a fresh, independently random
    national ID, phone number, and email address.
    """
    applicants = []
    for _ in range(num_applicants):
        full_name = random.choice(_NAMES)

        applicant = {
            "full_name": full_name,
            "national_id": _generate_national_id(),
            "contact_info": {
                "phone_number": _generate_phone_number(),
                "email_address": _generate_email(full_name)
            }
        }
        applicants.append(applicant)
    return applicants


if __name__ == "__main__":
    for generated_applicant in generate_applicants(10):
        print(generated_applicant)