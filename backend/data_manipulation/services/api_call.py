"""
this file is for calling the api and getting the data from the api
then add the data to the database
the api is  * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.1.65:5000

 based on api_documentation, the api has the following endpoints:
@permit_routes.route("/api/permits", methods=["GET"])
"""
import logging
import requests
from django.conf import settings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

def create_session():
    """
    create a request session with retry support
    """

    retry_strategy = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=1,
        status_forcelist=[
            500,
            502,
            503,
            504,
        ],
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)

    session = requests.Session()

    session.mount("http://", adapter)
    session.mount("https://", adapter)

    return session
# reuse the same HTTP session for the lifetime of the application to take advantage of connection pooling
session = create_session()

def fetch_permits(count=40):
    """
    Fetch permit data from the external Permit API.

    Args:
        count (int):
            Number of permits to retrieve.

    Returns:
        list[dict] | None
    """
    logger.info("Fetching %d permits from the API...", count)


    params = {"count": count}

    try:
        response = session.get(
            settings.PERMIT_API_URL,
            params=params,
            timeout=(5, 30),  # seconds
        )
        response.raise_for_status() # Raise an exception for HTTP errors

        permits = response.json()
        logger.info(
            "Successfully fetched %d permits from the API.",
            len(permits),
        )
        return permits
    except requests.exceptions.Timeout:
        logger.exception(
            "Request to Permit API timed out."
        )
    except requests.exceptions.ConnectionError:
        logger.exception(
            "Unable to connect to API."
        )
    except requests.exceptions.HTTPError:
        logger.exception(
            "Permit API returned an HTTP error: %s",
            response.status_code,
        )
    except requests.exceptions.RequestException:
        logger.exception(
            "Unexpected error communicating with Permit API."
        ) 
    return None