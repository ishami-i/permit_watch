"""
this is a simple api endpoints to be called by backend to get the data for the simulation.
"""
from flask import Flask, jsonify
from routes import permit_routes


app = Flask(__name__)

app.register_blueprint(
    permit_routes
)


@app.route("/")
def home():
    return jsonify({
        "message": "PermitWatch Simulation API is running",
        "status": "success"
    })


if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )