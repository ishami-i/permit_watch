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
        assigned_district__name=permit.supervisor.district,
    ).first()


def _flag_reason(permit):
    """
    Determine whether a permit should be flagged and, if so, why.

    Returns:
        str | None: a specific, human-readable reason if flagged,
        otherwise None.
    """
    timeline = getattr(permit, "timeline", None)
    if timeline is None:
        return None

    submission_date = timeline.submission_date
    response_date = timeline.response_date

    if response_date is None:
        days_pending = (timezone.now().date() - submission_date).days
        if days_pending > FIFO_AND_DELAY_THRESHOLD_DAYS:
            return (
                f"Still awaiting a response after {days_pending} days "
                f"(threshold: {FIFO_AND_DELAY_THRESHOLD_DAYS} days)."
            )
    else:
        processing_time = (response_date - submission_date).days
        if processing_time > FIFO_AND_DELAY_THRESHOLD_DAYS:
            return (
                f"Took {processing_time} days to receive a response "
                f"(threshold: {FIFO_AND_DELAY_THRESHOLD_DAYS} days)."
            )

    group = _comparison_group(permit).exclude(pk=permit.pk)
    for other in group:
        other_timeline = getattr(other, "timeline", None)
        if (
            other_timeline is None
            or other_timeline.response_date is None
            or response_date is None
        ):
            continue

        if (
            submission_date > other_timeline.submission_date
            and response_date < other_timeline.response_date
        ):
            return f"FIFO violation: submitted after Permit #{other.pk} but answered first."

        if (
            submission_date < other_timeline.submission_date
            and response_date > other_timeline.response_date
        ):
            return f"FIFO violation: submitted before Permit #{other.pk} but was answered after it."

    return None


def check_flagged_permit(permit):
    """Boolean-only wrapper kept for compatibility with get_flagged_permits()."""
    return _flag_reason(permit) is not None


def insert_flagged_permit(permit, refresh=False):
    """
    Create (or fetch/refresh the existing) Alert for a permit if it is flagged.

    Args:
        permit: A Permit model instance.
        refresh: If True and an Alert already exists for this permit,
            update its message/severity/officer to current values
            instead of leaving it untouched.

    Returns:
        Alert | None: None if the permit is not currently flagged.
    """
    reason = _flag_reason(permit)
    if reason is None:
        return None

    monitoring_officer = _find_monitoring_officer(permit)

    alert, created = Alert.objects.get_or_create(
        permit=permit,
        project=permit.project,
        defaults={
            "alert_severity": Alert.Severity.HIGH,
            "alert_message": reason,
            "alert_status": "pending",
            "supervisor": permit.supervisor,
            "monitoring_officer": monitoring_officer,
        },
    )

    if not created and refresh:
        alert.alert_message = reason
        alert.monitoring_officer = monitoring_officer
        # Deliberately NOT touching alert_status here — an officer may
        # have already investigated/resolved/dismissed this, and a
        # refresh shouldn't silently revert their work.
        alert.save()

    return alert

def get_flagged_permits(queryset=None):
    base = queryset if queryset is not None else Permit.objects.select_related(
        "timeline", "supervisor", "project"
    )
    return [permit for permit in base if check_flagged_permit(permit)]


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
def flag_all_permits(refresh=False):
    """
    Run insert_flagged_permit() against every permit currently in the
    system, persisting an Alert for each one that meets the flagging
    criteria.

    Args:
        refresh: If True, also updates alert_message/monitoring_officer
            on already-existing alerts to reflect current data.

    Returns:
        dict: {"checked": int, "flagged": int}
    """
    checked = 0
    flagged = 0
    for permit in Permit.objects.select_related("timeline", "supervisor", "project"):
        checked += 1
        alert = insert_flagged_permit(permit, refresh=refresh)
        if alert:
            flagged += 1
    return {"checked": checked, "flagged": flagged}