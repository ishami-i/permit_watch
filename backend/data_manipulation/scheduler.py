import logging

from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command

logger = logging.getLogger(__name__)

_scheduler = None


def _run_sync_job():
    logger.info("Scheduled sync_permits starting...")
    try:
        call_command("sync_permits", count=100)
    except Exception:
        logger.exception("Scheduled sync_permits failed")


def start_scheduler():
    global _scheduler
    if _scheduler is not None:
        return  # already running — avoid double-starting

    _scheduler = BackgroundScheduler(daemon=True)
    _scheduler.add_job(
        _run_sync_job, "interval", hours=1, id="hourly_permit_sync", replace_existing=True
    )
    _scheduler.start()
    logger.info("Hourly permit sync scheduler started.")