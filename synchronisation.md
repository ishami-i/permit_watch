# Developer Architecture Guide: Permit Synchronization Subsystem

## 1. Purpose

This guide documents the synchronization subsystem responsible for
importing permit data from an external API into the Django application.

## 2. Goals

-   Reliable scheduled synchronization
-   Idempotent imports
-   Clear separation of responsibilities
-   Easy maintenance and testing

## 3. Architecture

``` text
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

### api_call.py

Responsible only for HTTP communication. - Requests Session - Retries -
Timeouts - Authentication (future) - Returns Python dictionaries

### transformer.py

Responsible for: - Validation - Normalization - Default values - Schema
adaptation - Skipping malformed records

### populate_db.py

Responsible only for persistence. Uses: - update_or_create() -
transaction.atomic() - full_clean()

Contains helper methods for Applicants, Professionals, Property, Zoning,
Projects, FinancialData, Supervisors, Permit and Timeline.

### sync.py

Workflow coordinator. 1. Fetch 2. Transform 3. Persist 4. Return summary

## 5. Management Command

Location: data_manipulation/management/commands/sync_permits.py

Runs: python manage.py sync_permits

Supports: python manage.py sync_permits --count 100

## 6. Scheduler

Recommended: - cron - Celery Beat - APScheduler - Kubernetes CronJob

The scheduler executes only the management command.

## 7. Database Strategy

Natural keys are used with update_or_create() to avoid duplicates.

Each permit runs inside transaction.atomic().

Failure of one permit does not rollback the batch.

## 8. Logging

Each module defines:

logger = logging.getLogger(**name**)

Use: - info - warning - error - exception

Never use print().

## 9. Configuration

settings.py

PERMIT_API_URL

Loaded from environment variables.

## 10. Error Handling

API errors: - retries - timeout - logging

Database errors: - catch ValidationError and KeyError - continue
processing remaining permits

## 11. Idempotency

Running synchronization multiple times should: - update existing
records - insert new records - never duplicate data

## 12. Testing

Unit tests: - API client - Transformer - ORM helpers - Synchronization
orchestration

Integration tests: - End-to-end sync against test API.

## 13. Future Improvements

-   SyncJob model
-   Metrics
-   Prometheus
-   Dead-letter queue
-   Parallel page imports
-   Incremental synchronization
-   API authentication
-   Webhook support

## 14. Sequence Diagram

``` text
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

-   Single Responsibility Principle
-   Separation of Concerns
-   Idempotent synchronization
-   Fail-safe processing
-   Configuration over hardcoding
-   Reusable services
-   Production-ready scheduling
