from django.core.management.base import BaseCommand
from data_manipulation.services.flagged_project import flag_all_permits


class Command(BaseCommand):
    help = "Evaluate every permit against the flagging rules and persist Alerts for violations."

    def add_arguments(self, parser):
        parser.add_argument(
            "--refresh",
            action="store_true",
            help="Also update alert_message/monitoring_officer on already-existing alerts.",
        )

    def handle(self, *args, **options):
        result = flag_all_permits(refresh=options["refresh"])
        self.stdout.write(self.style.SUCCESS(
            f"Checked {result['checked']} permits, flagged {result['flagged']}."
        ))