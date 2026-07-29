"""
Client for the simulated external Permit API (see api_simulation/).

The API is a Flask app exposing:
    GET /api/permits?count=<int>&offset=<int>

`offset` is what makes repeated syncs additive instead of destructive —
it shifts the sequential IDs the simulator generates (PERMIT-, PRJ-,
PROP-) so each call returns a genuinely new, non-overlapping batch
instead of regenerating the same first N records every time.
"""
import logging

import requests
from django.conf import settings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


def create_session():
    """Create a request session with retry support."""
    retry_strategy = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)

    session = requests.Session()
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session


# reuse the same HTTP session for the lifetime of the application to take advantage of connection pooling
session = create_session()


def fetch_permits(count=40, offset=0):
    """
    Fetch permit data from the external Permit API.

    Args:
        count (int): Number of permits to retrieve this call.
        offset (int): Starting index for the batch. Pass the number of
            permits already synced so the simulator generates the next
            `count` records (offset+1 .. offset+count) instead of
            restarting from #1 every time.

    Returns:
        list[dict] | None
    """
    logger.info("Fetching %d permits from the API (offset=%d)...", count, offset)

    params = {"count": count, "offset": offset}

    try:
        response = session.get(
            settings.PERMIT_API_URL,
            params=params,
            timeout=(5, 30),  # seconds
        )
        response.raise_for_status()  # Raise an exception for HTTP errors

        permits = response.json()
        logger.info("Successfully fetched %d permits from the API.", len(permits))
        return permits
    except requests.exceptions.Timeout:
        logger.exception("Request to Permit API timed out.")
    except requests.exceptions.ConnectionError:
        logger.exception("Unable to connect to API.")
    except requests.exceptions.HTTPError:
        logger.exception("Permit API returned an HTTP error: %s", response.status_code)
    except requests.exceptions.RequestException:
        logger.exception("Unexpected error communicating with Permit API.")
    return None