# Developer Architecture Guide: Permit Synchronization Subsystem

## 1. Purpose

This guide documents the synchronization subsystem responsible for
importing permit data from an external API into the Django application.
For the backend's overall structure, see [`backend.md`](backend.md); for
the shape of the data being imported, see
[`api_documentation.md`](api_documentation.md#permit-object).

## 2. Goals

- Reliable scheduled synchronization
- Idempotent imports
- Clear separation of responsibilities
- Easy maintenance and testing

## 3. Architecture

```text
Scheduler
    |
    v
python manage.py sync_permits
    |
    v
Management Command
    |
    v
sync.py
 |-- api_call.fetch_permits()
 |-- transformer.transform_permits()
 `-- populate_db.populate_database()
                |
                v
           Django ORM
                |
                v
            Database
```

## 4. Components

All four modules below live in `data_manipulation/services/`.

### api_call.py

Responsible only for HTTP communication.
- Requests Session
- Retries
- Timeouts
- Authentication (future)
- Returns Python dictionaries

### transformer.py

Responsible for:
- Validation
- Normalization
- Default values
- Schema adaptation
- Skipping malformed records

### populate_db.py

Responsible only for persistence. Uses:
- `update_or_create()`
- `transaction.atomic()`
- `full_clean()`

Contains helper methods for Applicants, Professionals, Property, Zoning,
Projects, FinancialData, Supervisors, Permit and Timeline — see
[`backend.md`](backend.md#5-data-model) for how these map to Django models.

### sync.py

Workflow coordinator.
1. Fetch
2. Transform
3. Persist
4. Return summary

## 5. Management Command

Location: `data_manipulation/management/commands/sync_permits.py`

Runs: `python manage.py sync_permits`

Supports: `python manage.py sync_permits --count 100`

`quick_run.sh` at the repo root does **not** run this automatically — it
only handles migrations and static files on startup. Run syncs manually or
put them on a schedule; see [`backend.md`](backend.md#6-management-commands)
for the full list of management commands.

## 6. Scheduler

`data_manipulation/scheduler.py` runs sync (and flagging) jobs in-process,
so the app can keep its data current without depending on an external
cron daemon being configured on the host. It should still only ever call
into `sync_permits`/`flag_permits` at the management-command level, the
same as an external scheduler would — not import `sync.py` directly — so
behavior stays identical either way.

If an external scheduler is preferred instead (e.g. for a multi-instance
deployment where only one instance should run the job), any of the usual
options work equally well since they only ever invoke the management
command:
- cron
- Celery Beat
- APScheduler (standalone, outside the Django process)
- Kubernetes CronJob

## 7. Database Strategy

Natural keys are used with `update_or_create()` to avoid duplicates.

Each permit runs inside `transaction.atomic()`.

Failure of one permit does not roll back the batch.

## 8. Logging

Each module defines:

```python
logger = logging.getLogger(__name__)
```

Use: `info`, `warning`, `error`, `exception`.

Never use `print()`.

## 9. Configuration

`settings.py` reads `PERMIT_API_URL` from `backend/.env`. See
[`backend.md`](backend.md#4-configuration) for the full list of environment
variables and how `backend/.env` gets created.

## 10. Error Handling

API errors:
- retries
- timeout
- logging

Database errors:
- catch `ValidationError` and `KeyError`
- continue processing remaining permits

## 11. Idempotency

Running synchronization multiple times should:
- update existing records
- insert new records
- never duplicate data

## 12. Testing

Unit tests:
- API client
- Transformer
- ORM helpers
- Synchronization orchestration

Integration tests:
- End-to-end sync against the test API (the Flask simulator in
  `api_simulation/` — see [`api_simulation.md`](api_simulation.md)).

## 13. Future Improvements

- SyncJob model
- Metrics
- Prometheus
- Dead-letter queue
- Parallel page imports
- Incremental synchronization
- API authentication
- Webhook support

## 14. Sequence Diagram

```text
Scheduler
   |
   v
Management Command
   |
   v
sync.py
   |
   +--> api_call.py
   |        |
   |        v
   |   External API
   |
   +--> transformer.py
   |
   +--> populate_db.py
            |
            v
        Django Models
            |
            v
         Database
```

## 15. Design Principles

- Single Responsibility Principle
- Separation of Concerns
- Idempotent synchronization
- Fail-safe processing
- Configuration over hardcoding
- Reusable services
- Production-ready scheduling