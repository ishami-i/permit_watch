"""
Simple API server exposing simulated permit data for the backend to consume.
"""
import os

from flask import Flask, jsonify
from routes import permit_routes

app = Flask(__name__)
app.register_blueprint(permit_routes)


@app.route("/")
def home():
    return jsonify({
        "message": "PermitWatch Simulation API is running",
        "status": "success"
    })
@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))

    app.run(debug=debug_mode, host=host, port=port)