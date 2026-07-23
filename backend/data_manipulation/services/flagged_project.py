"""
Service for detecting permits that should be flagged for review.

A permit is flagged when either:
  - FIFO violation: within its comparison group (see below), a permit
    was answered out of submission order relative to another permit.
  - Processing time: the permit has gone unanswered for longer than
    FIFO_AND_DELAY_THRESHOLD_DAYS, or took longer than that to receive
    a response.

Comparison grouping (FIFO is only meaningful within a shared queue):
  - A permit with a supervisor assigned is compared only against other
    permits that share that same supervisor (i.e. the same district's
    queue) - a supervisor is required for this grouped comparison.
  - A permit with no supervisor assigned is instead compared against
    every other supervisor-less permit in the system.
"""
import logging

from django.utils import timezone

from ..models import Alert, Permit, Role, User

logger = logging.getLogger(__name__)

FIFO_AND_DELAY_THRESHOLD_DAYS = 21


def _comparison_group(permit):
    """
    Return the queryset of permits this permit should be FIFO-compared
    against.

    - If `permit` has a supervisor, the group is every permit sharing
      that supervisor (a supervisor is required for this grouping).
    - If `permit` has no supervisor, the group is every other permit
      that also has no supervisor.
    """
    base = Permit.objects.select_related("timeline", "supervisor")

    if permit.supervisor_id is not None:
        return base.filter(supervisor_id=permit.supervisor_id)

    return base.filter(supervisor__isnull=True)


def _find_monitoring_officer(permit):
    """
    Resolve the monitoring officer responsible for a permit: a User with
    the Monitoring_Officer role whose assigned_district matches the
    district of the permit's supervisor.

    Returns None if the permit has no supervisor, or no monitoring
    officer's assigned_district matches that supervisor's district.
    """
    if permit.supervisor_id is None:
        return None

    return User.objects.filter(
        user_role__role_name=Role.RoleNames.MONITORING_OFFICER,
        assigned_district=permit.supervisor.district,
    ).first()


def check_flagged_permit(permit):
    """
    Check if a single permit should be flagged, based on its own
    processing time and FIFO order within its comparison group.

    Args:
        permit: A Permit model instance.

    Returns:
        bool: True if the permit should be flagged, False otherwise.
    """
    timeline = getattr(permit, "timeline", None)
    if timeline is None:
        # Nothing to evaluate yet.
        return False

    submission_date = timeline.submission_date
    response_date = timeline.response_date

    # Processing time check (independent of grouping).
    if response_date is None:
        days_pending = (timezone.now().date() - submission_date).days
        if days_pending > FIFO_AND_DELAY_THRESHOLD_DAYS:
            return True
    else:
        processing_time = (response_date - submission_date).days
        if processing_time > FIFO_AND_DELAY_THRESHOLD_DAYS:
            return True

    # FIFO check within the comparison group.
    group = _comparison_group(permit).exclude(pk=permit.pk)

    for other in group:
        other_timeline = getattr(other, "timeline", None)
        if (
            other_timeline is None
            or other_timeline.response_date is None
            or response_date is None
        ):
            continue

        # This permit was submitted after `other` but answered first -
        # it jumped the queue.
        if (
            submission_date > other_timeline.submission_date
            and response_date < other_timeline.response_date
        ):
            return True

        # This permit was submitted before `other` but answered after it -
        # it was skipped over.
        if (
            submission_date < other_timeline.submission_date
            and response_date > other_timeline.response_date
        ):
            return True

    return False


def insert_flagged_permit(permit):
    """
    Create (or fetch the existing) Alert for a permit if it is flagged.

    Args:
        permit: A Permit model instance.

    Returns:
        Alert | None: None if the permit is not currently flagged.
    """
    if not check_flagged_permit(permit):
        return None

    monitoring_officer = _find_monitoring_officer(permit)

    alert, _ = Alert.objects.get_or_create(
        permit=permit,
        project=permit.project,
        alert_status="pending",
        defaults={
            "alert_severity": Alert.Severity.HIGH,
            "alert_message": (
                "FIFO violation or processing time exceeded "
                f"{FIFO_AND_DELAY_THRESHOLD_DAYS} days."
            ),
            "supervisor": permit.supervisor,
            "monitoring_officer": monitoring_officer,
        },
    )
    return alert


def get_flagged_permits():
    """
    Return every Permit that currently meets the flagging criteria.

    Returns:
        list[Permit]
    """
    return [
        permit
        for permit in Permit.objects.select_related(
            "timeline", "supervisor", "project"
        )
        if check_flagged_permit(permit)
    ]


def get_flagged_projects():
    """
    Compatibility wrapper for views.py, which imports this name directly.

    Returns:
        list[Project]: distinct projects that have at least one flagged
        permit, in the order their first flagged permit was found.
    """
    seen = set()
    projects = []
    for permit in get_flagged_permits():
        if permit.project_id not in seen:
            seen.add(permit.project_id)
            projects.append(permit.project)
    return projects