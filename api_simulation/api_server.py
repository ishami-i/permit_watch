"""
Permit Watch API Simulator

Simulates the external Permit API consumed by the Django backend.

Endpoints
---------
GET /api/permits
    Query Parameters:
        count   Number of permits to return (default: 100)
        offset  Starting offset (default: 0)

Run
---
python api_server.py
"""

from __future__ import annotations

import logging

from flask import Flask

from routes import permit_routes

###############################################################################
# Logging
###############################################################################

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)

###############################################################################
# App Factory
###############################################################################

def create_app() -> Flask:
    app = Flask(__name__)

    app.register_blueprint(permit_routes)

    @app.get("/")
    def health():
        return {
            "service": "Permit API Simulator",
            "status": "running",
            "version": "1.0.0",
        }, 200

    return app


###############################################################################
# Application
###############################################################################

app = create_app()

###############################################################################
# Main
###############################################################################

if __name__ == "__main__":

    HOST = "0.0.0.0"
    PORT = 5000

    logger.info("Starting Permit API Simulator...")
    logger.info("Listening on http://127.0.0.1:%s", PORT)

    app.run(
        host=HOST,
        port=PORT,
        debug=False,
        use_reloader=False,
        threaded=True,
    )