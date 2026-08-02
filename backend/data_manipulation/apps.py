import os
import sys
import fcntl
from django.apps import AppConfig


class DataManipulationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "data_manipulation"

    def ready(self):
        # Skip during management commands like migrate, makemigrations, etc.
        if any(cmd in sys.argv for cmd in ("migrate", "makemigrations", "collectstatic", "shell")):
            return

        lock_file = "/tmp/permitwatch_scheduler.lock"
        self._lock_fh = open(lock_file, "w")
        try:
            fcntl.flock(self._lock_fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except (IOError, OSError):
            # Another worker already holds the lock — don't start a second scheduler
            return

        from .scheduler import start_scheduler
        print("SCHEDULER: lock acquired, starting scheduler", flush=True)
        start_scheduler()
