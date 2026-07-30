# Developer Guide: Django Backend

## 1. Purpose

This is the system of record for PermitWatch: it stores permit data synced
from the external permit API (simulated locally by [`api_simulation.md`](api_simulation.md)),
serves it to the frontend over a REST API, handles authentication/roles,
flags suspicious permits, and runs the background jobs that keep the data
current. See [`synchronisation.md`](synchronisation.md) for the sync
subsystem specifically, and [`deployment.md`](deployment.md) for how to
put this on a server — this document covers the backend's own structure.

## 2. Stack

- Django + Django REST Framework
- SQLite (development/current database)
- gunicorn as the production WSGI server, run behind nginx

## 3. Project layout

```
backend/
├── manage.py
├── db.sqlite3
├── config/                        # Django project package
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py                    # entry point gunicorn serves (config.wsgi:application)
│   └── asgi.py
└── data_manipulation/              # main Django app
    ├── apps.py
    ├── admin.py
    ├── urls.py                     # app-level URL routes
    ├── views.py                    # permit-facing viewsets/endpoints
    ├── serializer.py                # DRF serializers for permit-side models
    ├── auth_views.py                # login/auth endpoints
    ├── auth_serializers.py          # serializers for auth_views
    ├── permission.py                # DRF permission classes (role-based access)
    ├── scheduler.py                 # in-process job scheduler (sync/flag jobs)
    ├── tests.py
    ├── models/                      # one file per model
    │   ├── __init__.py
    │   ├── permit.py
    │   ├── timeline.py
    │   ├── applicant.py
    │   ├── professional.py
    │   ├── property.py
    │   ├── zoning.py
    │   ├── project.py
    │   ├── financial_data.py
    │   ├── supervisor.py
    │   ├── alert.py
    │   ├── alert_comment.py
    │   ├── user.py
    │   ├── role.py
    │   └── district.py
    ├── services/                    # business logic, kept out of views/models
    │   ├── api_call.py              # HTTP client for the external permit API
    │   ├── transformer.py           # validates/normalizes fetched permits
    │   ├── populate_db.py           # persists transformed permits
    │   ├── sync.py                  # coordinates fetch → transform → persist
    │   ├── flagged_project.py       # flagging logic used by flag_permits
    │   ├── get_permit.py            # permit lookup/query logic used by views.py
    │   ├── auth_service.py          # login/token logic used by auth_views.py
    │   └── user_service.py          # user/role/district logic
    ├── management/
    │   └── commands/
    │       ├── sync_permits.py
    │       └── flag_permits.py
    └── migrations/
```

## 4. Configuration

Settings are read from `backend/.env`. `quick_run.sh` creates this file
automatically on first run (from `backend/.env.example` if one exists,
otherwise a minimal default) — it is never committed to version control.

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django's cryptographic signing key. Auto-generated per-install if not supplied. |
| `DEBUG` | `True`/`False`. `quick_run.sh` defaults this to `False` since it's meant for a server behind nginx. |
| `ALLOWED_HOSTS` | Comma-separated hostnames Django will serve. Update this to your actual domain before going live. |
| `PERMIT_API_URL` | Base URL the sync subsystem pulls permits from — points at the local Flask simulator by default (`http://127.0.0.1:5000/api/permits`), or the real Kubaka-style API once one exists. |

`STATIC_ROOT` (in `config/settings.py`) determines where `collectstatic`
writes files for nginx to serve under `/static/`.

## 5. Data model

`data_manipulation/models/` has one file per model. Permit-side models
mirror the object documented in
[`api_documentation.md`](api_documentation.md#permit-object) and are
populated by `services/populate_db.py` (see `synchronisation.md`).
Auth/ops-side models support login, roles, and flagging.

**Permit data**
- **Permit** — the central record; ties together a timeline, an applicant,
  a property, a project, and a supervisor.
- **Timeline** — submission/resubmission/response/issuance/expiration
  dates, status, and review duration for one permit.
- **Applicant** — full name, national ID, phone, email.
- **Professional** — engineer/architect/surveyor details linked to a permit.
- **Property** — parcel identity (UPI, address, GIS coordinates,
  administrative location) plus its **Zoning** rules.
- **Project** — building characteristics (purpose, floors, height, floor
  area) plus its **FinancialData** breakdown (permit/inspection/design/
  survey fees, contingency, total cost, currency).
- **Supervisor** — the government official assigned to a property's
  district.

**Alerts**
- **Alert** — raised against a permit by `services/flagged_project.py` /
  `flag_permits` when it looks suspicious or anomalous.
- **AlertComment** — comments left on an Alert, presumably by monitoring
  officers/ombudsman roles working the case (see `frontend.md`'s `alerts/`
  components).

**Auth & access**
- **User** — the custom user model.
- **Role** — the role a User has (`chief_ombudsman`, `deputy_ombudsman`,
  `monitoring_officer` — see §9 below and `frontend.md`).
- **District** — a user's assigned district, used to scope what a
  `monitoring_officer` can see.

All permit sync writes use `update_or_create()` on natural keys, so
re-running a sync never duplicates records — see `synchronisation.md` §11
for the idempotency guarantee.

## 6. Management commands

Run these from `backend/` with the shared virtualenv activated
(`source ../.venv/bin/activate`). They are **not** run automatically by
`quick_run.sh` — only migrations and `collectstatic` run on every start —
so use these directly for day-to-day operations:

| Command | Purpose |
|---|---|
| `python manage.py sync_permits` | Pull permits from `PERMIT_API_URL`, transform, and upsert them (`services/sync.py`). Supports `--count N`. |
| `python manage.py flag_permits` | Flag suspicious/anomalous permits already in the database (`services/flagged_project.py`). Supports `--refresh` to re-evaluate existing flags. |
| `python manage.py createsuperuser` | Create an admin account for `/admin/`. |
| `python manage.py shell` | Django shell with the project's settings loaded. |
| `python manage.py migrate` / `makemigrations data_manipulation` | Standard schema management. |

`data_manipulation/scheduler.py` can also trigger these jobs in-process
instead of (or alongside) an external scheduler — see
[`synchronisation.md`](synchronisation.md#6-scheduler) for how it fits in.

## 7. Running the backend

`quick_run.sh` (at the repo root) is the standard way to bring the backend
up as part of the whole stack — see the root [`README.md`](README.md) and
[`deployment.md`](deployment.md) for full server setup.

To run just the backend by hand:

```bash
cd backend
source ../.venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 127.0.0.1:8000
```

or, for local development without gunicorn:

```bash
python manage.py runserver 8000
```

## 8. Logging

Application code should use module-level loggers
(`logger = logging.getLogger(__name__)`) rather than `print()`, per
`synchronisation.md` §8. When run via `quick_run.sh`, gunicorn's access and
error logs are written to `logs/backend.log`.

## 9. Auth, roles & permissions

`auth_views.py` / `auth_serializers.py` / `services/auth_service.py` handle
login and issuing whatever credentials the frontend's `AuthContext` stores.
`permission.py` defines the DRF permission classes that gate access per
role — this is where role checks belong, not just in the frontend's route
guards (`ProtectedRoute` in `frontend.md`).

The frontend expects three roles: `chief_ombudsman` / `deputy_ombudsman`
(full access) and `monitoring_officer` (scoped by `District`, via the
`assigned_district` relationship on `User`).

## 10. Related documentation

- [`synchronisation.md`](synchronisation.md) — the sync subsystem in detail
- [`api_documentation.md`](api_documentation.md) — the shape of permit data
  the backend consumes
- [`frontend.md`](frontend.md) — what the frontend expects the backend's
  REST API to return
- [`deployment.md`](deployment.md) — installing and running all of this on
  a server, behind nginx