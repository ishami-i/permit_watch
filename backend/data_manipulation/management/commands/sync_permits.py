from django.core.management.base import BaseCommand
from data_manipulation.models import Permit
from data_manipulation.services.sync import sync_permits


class Command(BaseCommand):
    """
    Django management command for synchronizing permit data from the external API.
    """
    help = (
        "Fetch a fresh batch of NEW permit data from the external API, "
        "validate it, and add it to the local database without disturbing "
        "already-synced permits."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=100,
            help="Number of NEW permits to fetch this run (max 500 per call, default: 100).",
        )

    def handle(self, *args, **options):
        count = options["count"]
        offset = Permit.objects.count()  # assumes contiguous numbering starting at #1

        self.stdout.write(
            self.style.NOTICE(
                f"Currently {offset} permits in the database. "
                f"Fetching {count} new ones starting at #{offset + 1}..."
            )
        )
        result = sync_permits(count=count, offset=offset)
        self.stdout.write(
            self.style.SUCCESS(
                "Synchronization completed successfully."
            )
        )
        self.stdout.write(
            f"""
Summary
-------
Fetched : {result['fetched']}
Created : {result['created']}
Updated : {result['updated']}
Failed  : {result['failed']}
"""
        )