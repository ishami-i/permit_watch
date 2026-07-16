"""
Simple API endpoints used by the backend to retrieve
simulated permit data.
"""

from flask import Blueprint, jsonify

from data_generator.permit import generate_permits

permit_routes = Blueprint(
    "permit_routes",
    __name__
)

# get permits endpoint to get permit data from the data generator
@permit_routes.route(
    "/api/permits",
    methods=["GET"]
)
def get_permits():

    permits_data = generate_permits(10)

    return jsonify(permits_data)