import os
import sys
from django.apps import AppConfig


class DataManipulationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "data_manipulation"

    def ready(self):
        if "runserver" in sys.argv and os.environ.get("RUN_MAIN") == "true":
            from .scheduler import start_scheduler
            start_scheduler()