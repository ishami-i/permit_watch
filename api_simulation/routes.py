"""
Simple API endpoints used by the backend to retrieve simulated permit data.
"""
from flask import Blueprint, jsonify, request
from data_generator.permit import generate_permits

permit_routes = Blueprint("permit_routes", __name__)

DEFAULT_PERMIT_COUNT = 10
MAX_PERMIT_COUNT = 500


@permit_routes.route("/api/permits", methods=["GET"])
def get_permits():
    """
    Returns simulated permit data.

    Query params:
        count (int, optional): number of permits to generate this call.
            Defaults to 10, capped at 500 per call.
        offset (int, optional): starting index for sequential IDs
            (PERMIT-, PRJ-, PROP-). Defaults to 0. Use this to generate
            a fresh, non-overlapping batch beyond what's already been
            fetched - e.g. offset=500&count=100 returns permits #501-600.
    """
    count_param = request.args.get("count", DEFAULT_PERMIT_COUNT)
    offset_param = request.args.get("offset", 0)

    try:
        count = int(count_param)
    except (TypeError, ValueError):
        return jsonify({
            "error": f"'count' must be an integer, got {count_param!r}"
        }), 400

    try:
        offset = int(offset_param)
    except (TypeError, ValueError):
        return jsonify({
            "error": f"'offset' must be an integer, got {offset_param!r}"
        }), 400

    if count <= 0:
        return jsonify({"error": "'count' must be a positive integer"}), 400

    if count > MAX_PERMIT_COUNT:
        return jsonify({
            "error": f"'count' cannot exceed {MAX_PERMIT_COUNT}"
        }), 400

    if offset < 0:
        return jsonify({"error": "'offset' must be zero or a positive integer"}), 400

    permits_data = generate_permits(count, offset=offset)
    return jsonify(permits_data)