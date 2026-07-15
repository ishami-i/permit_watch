"""generate_properties()
    Land Data
        Unique Parcel Identifier (UPI)
        Physical address
        GIS coordinates (latitude and longitude)

    Zoning and Restrictions
        Land use classification
        Permitted building rights
        Environmental protection boundaries
        Urban planning restrictions
"""
import json
import random
from pathlib import Path


def load_locations():
    """
    Load administrative locations from sample_data/location.json.
    """

    current_dir = Path(__file__).resolve().parent

    location_file = (
        current_dir.parent
        / "sample_data"
        / "location.json"
    )

    with open(
        location_file,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def generate_properties(num_properties):
    """
    Generate realistic property records for Rwanda.

    Generates:

    - Property ID
    - Unique Parcel Identifier (UPI)
    - Physical address
    - Administrative location
    - GIS coordinates
    - Zoning data
    """

    locations = load_locations()

    properties = []

    # District prefixes used to generate street names

    street_prefixes = {

        # Kigali
        "Nyarugenge": "KN",
        "Gasabo": "KG",
        "Kicukiro": "KK",

        # Northern
        "Musanze": "NM",
        "Burera": "NB",
        "Gakenke": "NG",
        "Gicumbi": "NC",
        "Rulindo": "NR",

        # Southern
        "Huye": "SH",
        "Muhanga": "SM",
        "Nyanza": "SN",
        "Kamonyi": "SK",
        "Ruhango": "SR",
        "Gisagara": "SG",
        "Nyamagabe": "SY",
        "Nyaruguru": "SU",

        # Western
        "Rubavu": "WR",
        "Rusizi": "WS",
        "Karongi": "WK",
        "Nyamasheke": "WN",
        "Rutsiro": "WT",
        "Ngororero": "WO",
        "Nyabihu": "WB",

        # Eastern
        "Bugesera": "EB",
        "Gatsibo": "EG",
        "Kayonza": "EK",
        "Kirehe": "EH",
        "Ngoma": "EN",
        "Nyagatare": "EY",
        "Rwamagana": "ER"
    }

    province_codes = {
        "Kigali City": "1",
        "Southern": "2",
        "Western": "3",
        "Northern": "4",
        "Eastern": "5"
    }

    gps_bounds = {

        "Kigali City": {
            "lat": (-2.05, -1.90),
            "lon": (30.00, 30.20)
        },

        "Northern": {
            "lat": (-1.85, -1.35),
            "lon": (29.45, 30.25)
        },

        "Southern": {
            "lat": (-2.85, -2.05),
            "lon": (29.30, 30.10)
        },

        "Western": {
            "lat": (-2.50, -1.40),
            "lon": (28.85, 29.75)
        },

        "Eastern": {
            "lat": (-2.50, -1.20),
            "lon": (30.10, 30.90)
        }
    }

    land_use_types = [
        "residential",
        "commercial",
        "industrial",
        "mixed-use",
        "agricultural",
        "institutional"
    ]

    permitted_building_rights = {

        "residential": [
            "single-family house",
            "duplex",
            "apartments"
        ],

        "commercial": [
            "offices",
            "shops",
            "mall"
        ],

        "industrial": [
            "factory",
            "warehouse"
        ],

        "mixed-use": [
            "shops and apartments",
            "offices and apartments"
        ],

        "agricultural": [
            "farming",
            "livestock"
        ],

        "institutional": [
            "school",
            "hospital",
            "government office"
        ]
    }

    environmental_boundaries = [
        "none",
        "wetland",
        "river buffer zone",
        "forest reserve",
        "protected area"
    ]

    urban_restrictions = [
        "none",
        "height restriction",
        "road reserve",
        "heritage zone",
        "airport corridor",
        "flood-risk area"
    ]

    provinces = list(locations.keys())
    for i in range(num_properties):

        # Administrative hierarchy

        province = random.choice(provinces)

        district = random.choice(
            list(locations[province].keys())
        )

        sector = random.choice(
            locations[province][district]
        )

        # Parcel number
        plot_number = random.randint(
            100,
            9999
        )

        province_code = province_codes[province]

        district_code = (
            f"{list(locations[province].keys()).index(district) + 1:02d}"
        )

        sector_code = (
            f"{locations[province][district].index(sector) + 1:02d}"
        )

        upi = (
            f"{province_code}/"
            f"{district_code}/"
            f"{sector_code}/"
            f"{plot_number}"
        )

        # Address

        prefix = street_prefixes.get(district)

        if prefix:

            road_number = random.randint(
                1,
                999
            )

            physical_address = (
                f"{prefix} {road_number} St, "
                f"Plot {plot_number}, "
                f"{sector}, "
                f"{district}, "
                f"{province}"
            )

        else:

            road_type = random.choice(
                ["RN", "RP"]
            )

            road_number = random.randint(
                1,
                30
            )

            physical_address = (
                f"{road_type} {road_number}, "
                f"Plot {plot_number}, "
                f"{sector}, "
                f"{district}, "
                f"{province}"
            )

        # Coordinates

        bounds = gps_bounds[province]

        latitude = round(
            random.uniform(
                bounds["lat"][0],
                bounds["lat"][1]
            ),
            6
        )

        longitude = round(
            random.uniform(
                bounds["lon"][0],
                bounds["lon"][1]
            ),
            6
        )

        # Zoning

        land_use = random.choice(
            land_use_types
        )

        zoning = {

            "land_use_classification":
                land_use,

            "permitted_building_rights":
                random.choice(
                    permitted_building_rights[land_use]
                ),

            "environmental_protection_boundaries":
                random.choice(
                    environmental_boundaries
                ),

            "urban_planning_restrictions":
                random.choice(
                    urban_restrictions
                )
        }

        property_data = {

            "property_id":
                f"PROP-{i + 1:05d}",

            "upi":
                upi,

            "physical_address":
                physical_address,

            "administrative_location": {

                "province":
                    province,

                "district":
                    district,

                "sector":
                    sector
            },

            "gis_coordinates": {

                "latitude":
                    latitude,

                "longitude":
                    longitude
            },

            "zoning":
                zoning
        }

        properties.append(property_data)

    return properties


if __name__ == "__main__":

    properties = generate_properties(10)