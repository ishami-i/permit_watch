"""
this module would be used to generate random applicant data for testing purposes.

generate_applicants()
    Full name
    National ID or passport number
    Contact information (phone number, email address)
"""

import random
import string
import json
import pathlib as Path


# find root directory containing sample data
root_dir = Path.Path(__file__).resolve().parent.parent

# define the file path 
file_path = root_dir / 'sample_data' / 'names.json'

# open and load the names from the json file
with open(file_path, 'r') as file:
    names_list = json.load(file)

# Function to generate a data but names is not random, it is from a list of names

def generate_applicants(num_applicants):
    names = names_list['names']
    applicants = []
    for _ in range(num_applicants):
        full_name = random.choice(names)
        # generating random id
        first_part = "1"
        second_part = str(random.randint(1930, 2015)) # random year between 1930 and 2015
        third_part = random.choice(["7", "8"])
        final_part = "".join(random.choices(string.digits, k=10))
        # final national id is a combination of the first part, second part, third part and final part
        national_id = first_part + second_part + third_part + final_part

        # generating random phone number
        phone_number = "+250" + "".join(random.choices("0123456789", k=9))

        # generating random email address
        email_address = full_name.lower().replace(" ", ".") + str(random.randint(1, 100)) + "@gmail.com"

        applicant = {
            "full_name": full_name,
            "national_id": national_id,
            "contact_info": {
                "phone_number": phone_number,
                "email_address": email_address
            }
        }
        applicants.append(applicant)
    return applicants

if __name__ == "__main__":
    # Generate 10 random applicants and print them
    generated_applicants = generate_applicants(10)
    for applicant in generated_applicants:
        print(applicant)

