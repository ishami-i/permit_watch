"""
Coordinates synchronization between the external Permit API and the database.

Workflow:
    1. Fetch permit data from the API.
    2. Validate and normalize the data.
    3. Insert or update records in the database.
    4. Return a synchronization summary.
"""
import logging
from .api_call import fetch_permits
from .populate_db import populate_database
from .transformer import transform_permits

logger = logging .getLogger(__name__)

def sync_permits(count=40):
    """
    Synchronize permits from the external API into the local database.

    Args:
        count (int): Number of permits to fetch.

    Returns:
        dict:
            {
                "fetched": int,
                "created": int,
                "updated": int,
                "failed": int,
            }
    """
    logger.info("Starting permit synchronization...")

    permits = fetch_permits(count)
    if permits is None:
        logger.error("Permit synchronization aborted: unable to fetch data")

        return {
            "fetched": 0,
            "created": 0,
            "updated": 0,
            "failed": 0,
        }
    if not permits:
        logger.info("API returned no permits.")

        return {
            "fetched": 0,
            "created": 0,
            "updated": 0,
            "failed": 0,
        }
    logger.info(
        "%d permits remaining after validation.",
        len(permits),
    )

    result = populate_database(permits)

    summary = {
        "fetched": len(permits),
        "created": result["created"],
        "updated": result["updated"],
        "failed": result["failed"],
    }
    logger.info(
        "synchronisation completed."
        "Fetched=%d, Created=%d, Updated=%d, Failed=%d",
        summary["fetched"],
        summary["created"],
        summary["updated"],
        summary["failed"]
    )
    return summary