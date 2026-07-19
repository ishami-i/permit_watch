"""
generate_properties()
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

_ROOT_DIR = Path(__file__).resolve().parent.parent
_LOCATION_FILE = _ROOT_DIR / "sample_data" / "location.json"

# District prefixes used to generate street names
_STREET_PREFIXES = {
    # Kigali
    "Nyarugenge": "KN", "Gasabo": "KG", "Kicukiro": "KK",
    # Northern
    "Musanze": "NM", "Burera": "NB", "Gakenke": "NG", "Gicumbi": "NC", "Rulindo": "NR",
    # Southern
    "Huye": "SH", "Muhanga": "SM", "Nyanza": "SN", "Kamonyi": "SK", "Ruhango": "SR",
    "Gisagara": "SG", "Nyamagabe": "SY", "Nyaruguru": "SU",
    # Western
    "Rubavu": "WR", "Rusizi": "WS", "Karongi": "WK", "Nyamasheke": "WN", "Rutsiro": "WT",
    "Ngororero": "WO", "Nyabihu": "WB",
    # Eastern
    "Bugesera": "EB", "Gatsibo": "EG", "Kayonza": "EK", "Kirehe": "EH", "Ngoma": "EN",
    "Nyagatare": "EY", "Rwamagana": "ER"
}

_PROVINCE_CODES = {
    "Kigali City": "1",
    "Southern": "2",
    "Western": "3",
    "Northern": "4",
    "Eastern": "5"
}

_GPS_BOUNDS = {
    "Kigali City": {"lat": (-2.05, -1.90), "lon": (30.00, 30.20)},
    "Northern": {"lat": (-1.85, -1.35), "lon": (29.45, 30.25)},
    "Southern": {"lat": (-2.85, -2.05), "lon": (29.30, 30.10)},
    "Western": {"lat": (-2.50, -1.40), "lon": (28.85, 29.75)},
    "Eastern": {"lat": (-2.50, -1.20), "lon": (30.10, 30.90)}
}

_LAND_USE_TYPES = [
    "residential", "commercial", "industrial", "mixed-use", "agricultural", "institutional"
]

_PERMITTED_BUILDING_RIGHTS = {
    "residential": ["single-family house", "duplex", "apartments"],
    "commercial": ["offices", "shops", "mall"],
    "industrial": ["factory", "warehouse"],
    "mixed-use": ["shops and apartments", "offices and apartments"],
    "agricultural": ["farming", "livestock"],
    "institutional": ["school", "hospital", "government office"]
}

_ENVIRONMENTAL_BOUNDARIES = [
    "none", "wetland", "river buffer zone", "forest reserve", "protected area"
]

_URBAN_RESTRICTIONS = [
    "none", "height restriction", "road reserve", "heritage zone",
    "airport corridor", "flood-risk area"
]


def load_locations():
    """Load administrative locations from sample_data/location.json."""
    with open(_LOCATION_FILE, "r", encoding="utf-8") as file:
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
    provinces = list(locations.keys())

    for i in range(num_properties):
        # Administrative hierarchy
        province = random.choice(provinces)
        district = random.choice(list(locations[province].keys()))
        sector = random.choice(locations[province][district])

        # Parcel number
        plot_number = random.randint(100, 9999)

        province_code = _PROVINCE_CODES[province]
        district_code = f"{list(locations[province].keys()).index(district) + 1:02d}"
        sector_code = f"{locations[province][district].index(sector) + 1:02d}"

        upi = f"{province_code}/{district_code}/{sector_code}/{plot_number}"

        # Address
        prefix = _STREET_PREFIXES.get(district)
        if prefix:
            road_number = random.randint(1, 999)
            physical_address = (
                f"{prefix} {road_number} St, Plot {plot_number}, "
                f"{sector}, {district}, {province}"
            )
        else:
            road_type = random.choice(["RN", "RP"])
            road_number = random.randint(1, 30)
            physical_address = (
                f"{road_type} {road_number}, Plot {plot_number}, "
                f"{sector}, {district}, {province}"
            )

        # Coordinates
        bounds = _GPS_BOUNDS[province]
        latitude = round(random.uniform(*bounds["lat"]), 6)
        longitude = round(random.uniform(*bounds["lon"]), 6)

        # Zoning
        land_use = random.choice(_LAND_USE_TYPES)
        zoning = {
            "land_use_classification": land_use,
            "permitted_building_rights": random.choice(_PERMITTED_BUILDING_RIGHTS[land_use]),
            "environmental_protection_boundaries": random.choice(_ENVIRONMENTAL_BOUNDARIES),
            "urban_planning_restrictions": random.choice(_URBAN_RESTRICTIONS)
        }

        property_data = {
            "property_id": f"PROP-{i + 1:05d}",
            "upi": upi,
            "physical_address": physical_address,
            "administrative_location": {
                "province": province,
                "district": district,
                "sector": sector
            },
            "gis_coordinates": {
                "latitude": latitude,
                "longitude": longitude
            },
            "zoning": zoning
        }

        properties.append(property_data)

    return properties


if __name__ == "__main__":
    for generated_property in generate_properties(10):
        print(generated_property)