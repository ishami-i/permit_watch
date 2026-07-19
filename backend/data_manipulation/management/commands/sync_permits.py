from django.core.management.base import BaseCommand

from data_manipulation.services.sync import sync_permits


class Command(BaseCommand):
    """
    Django management command for synchronizing permit data from the external API.
    """

    help = (
        "Fetch permit data from the external API, validate it, "
        "and synchronize the local database."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=40,
            help="Number of permits to fetch from the external API (default: 40).",
        )

    def handle(self, *args, **options):
        count = options["count"]

        self.stdout.write(
            self.style.NOTICE(
                f"Starting permit synchronization (count={count})..."
            )
        )

        result = sync_permits(count=count)

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