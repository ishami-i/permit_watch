# PermitWatch Rwanda Platform

PermitWatch Rwanda is a civic technology platform designed to improve transparency and accountability in government permit and licensing processes. The platform enables office of ombudsman to monitor application progress, and access public information about permits, helping reduce corruption and increase public trust.

## Live Deployment

A live instance is deployed at: **https://permit-watch.ishami.tech/**

### Test accounts

The following accounts are available on the deployed instance for testing/demo purposes. They all share the same password:

| Email | Role | Password |
|---|---|---|
| `chief@permitwatch.rw` | Chief | `Passw0rd!2026` |
| `deputy@chief@permitwatch.rw` | Deputy Chief | `Passw0rd!2026` |
| `officer.gasabo@permitwatch.rw` | Officer (Gasabo) | `Passw0rd!2026` |

> ⚠️ These are demo credentials on a non-production/testing deployment only.

## Project Structure

```
permit_watch/
├── README.md
├── backend.md
├── deployment.md
├── api_documentation.md
├── api_simulation.md
├── frontend.md
├── synchronisation.md
├── quick_run.sh               # One-shot setup + run script (nginx-ready)
├── requirements.txt           # Python dependencies (shared by backend + API simulator)
├── api_simulation/            # Flask API simulator (mock permit data source)
│   ├── api_server.py
│   ├── routes.py
│   ├── data_generator/
│   └── sample_data/
├── backend/                   # Django backend
│   ├── manage.py
│   ├── config/                 # Django project settings
│   └── data_manipulation/      # Main Django app
│       ├── models/              # permit, auth, and alert models
│       ├── services/            # sync, flagging, auth business logic
│       ├── management/commands/ # sync_permits, flag_permits
│       └── scheduler.py         # in-process job scheduler
├── frontend/                  # React + Vite user interface
│   ├── src/
│   └── public/
└── docs/
    ├── document/
    │   └── SRS-document.pdf    # Software Requirements Specification
    └── drawings/
        ├── activity_diagram.drawio
        ├── class-diagram.drawio
        ├── deployment.drawio
        └── use_case_diagram.drawio
```

## Features

- User registration and authentication
- Permit application tracking
- Transparency dashboard
- Notifications on permit status
- Administrative management portal
- Search and filtering of permit records
- Scheduled/manual permit synchronization from an external permit data source
- Automated flagging of suspicious or anomalous permits

## Technology Stack

### Frontend
- React (Vite), built for production with `npm run build` — nginx serves the resulting `frontend/dist/` directly

### Backend
- Django + Django REST Framework
- gunicorn as the production WSGI server, run behind nginx (add `gunicorn` to `requirements.txt` if it isn't already there)

### Database
- SQLite (development)

### API Simulation
- Flask — simulates the external government permit API, so the backend has a stable data source to sync against without needing live access to the real system

## Documentation

Project documentation lives at the repo root, next to `README.md`:

- **[`backend.md`](backend.md)** — Django backend structure, configuration, data model, and management commands
- **[`deployment.md`](deployment.md)** — installing and running this on a server behind nginx (systemd, nginx config, HTTPS, redeploying)
- **[`api_documentation.md`](api_documentation.md)** — full reference for the simulated permit API (endpoints, permit object shape, error responses)
- **[`api_simulation.md`](api_simulation.md)** — design notes on how the simulation is built
- **[`frontend.md`](frontend.md)** — frontend structure, roles, and what it expects from the backend API
- **[`synchronisation.md`](synchronisation.md)** — architecture of the permit sync subsystem
- **Software Requirements Specification (SRS)** — `docs/document/SRS-document.pdf`
- **System diagrams** — Activity, Use Case, Class, and Deployment diagrams under `docs/drawings/`

## Installation

### Clone the repository

```bash
git clone https://github.com/ishami-i/permit_watch.git
cd permit_watch
```

### Quick start

There are **two** one-shot scripts in the repo root, for two different situations. Both share the same `.venv` and `requirements.txt`, but they start different servers:

| Script | Use case | Frontend | Backend server |
|---|---|---|---|
| `local_quick-run.sh` | Local development on your machine | Vite dev server (`:5173`, hot reload) | `manage.py runserver` (`:8000`) |
| `quick_run.sh` | Deployed instance behind nginx (e.g. the [live deployment](#live-deployment)) | Built to `frontend/dist/`, served as static files by nginx | gunicorn (`127.0.0.1:8000`) |

Don't mix them up: `local_quick-run.sh` is for fast iteration and isn't meant to sit behind nginx (no `collectstatic`, no production build, no gunicorn), while `quick_run.sh` is meant for the server and won't give you hot reload.

#### Local development

```bash
chmod +x local_quick-run.sh
./local_quick-run.sh
```

This starts the Flask API simulator, the Django dev server, and the Vite dev server, all in the foreground/background as needed, all against the single shared `.venv`. Press `Ctrl+C` to stop everything.

#### Deployed / production

`quick_run.sh` does everything in one pass — no subcommands, nothing to remember. Run it and it sets up and starts the whole stack, ready to sit behind nginx:

```bash
chmod +x quick_run.sh
./quick_run.sh
```

What it does, in order:

1. Creates/reuses a single shared virtual environment at `.venv/` and installs `requirements.txt`
2. Creates `logs/` (`logs/api_simulation.log`, `logs/backend.log`) if it doesn't exist
3. Creates `backend/.env` (from `backend/.env.example` if present, otherwise a minimal default with a freshly generated `DJANGO_SECRET_KEY`) if it doesn't already exist
4. Runs Django migrations
5. Runs `collectstatic` so Django's static assets are ready for nginx
6. Installs frontend packages (first run only) and builds the React app to `frontend/dist` — nginx should point at this directory directly rather than a dev server
7. Starts the Flask API simulator in the background (logged to `logs/api_simulation.log`)
8. Starts the Django backend in the foreground via **gunicorn** on `127.0.0.1:8000` (falls back to `manage.py runserver` with a warning if gunicorn isn't installed — fine for testing, not for production)

Press `Ctrl+C` to stop the backend; the API simulator is shut down along with it.

Re-run `quick_run.sh` on every deploy (or wire it into your deploy pipeline) to reapply migrations, rebuild the frontend, and restart the backend. If you've changed frontend code, re-running this (or `npm run build`) is what refreshes `frontend/dist/` — nginx otherwise keeps serving the older build.

Running it directly in a terminal is fine for testing, but on a real server you'll want systemd managing it so it survives reboots and SSH disconnects — see [`deployment.md`](deployment.md#4-run-it-as-a-service-systemd).

### nginx

See [`deployment.md`](deployment.md#5-nginx) for a full server block. In short, nginx should serve `frontend/dist/` as static files, reverse-proxy `/api/` and `/admin/` to `127.0.0.1:8000`, and serve `/static/` from Django's `STATIC_ROOT`. The Flask API simulator (port 5000) is internal only — the backend talks to it directly via `PERMIT_API_URL`; nginx should never expose it publicly.

### Manual setup

If you'd rather run each piece by hand instead of `quick_run.sh`:

#### Backend

```bash
cd backend
python3 -m venv ../.venv
source ../.venv/bin/activate
pip install -r ../requirements.txt
python manage.py makemigrations data_manipulation
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 127.0.0.1:8000
```

#### API simulator

Uses the same shared `.venv` as the backend — no separate environment:

```bash
source .venv/bin/activate   # from the repo root; skip if already active in this shell
cd api_simulation
python api_server.py
```

#### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run build   # outputs to frontend/dist, for nginx to serve
```

### Day-to-day operations

`quick_run.sh` only ever runs migrations and `collectstatic` automatically. For everything else, use `manage.py` directly with the shared venv activated — see [`backend.md`](backend.md#6-management-commands) for the full list:

```bash
source .venv/bin/activate
cd backend
python manage.py sync_permits --count 100   # pull permits from PERMIT_API_URL
python manage.py flag_permits               # flag suspicious permits
python manage.py createsuperuser            # create an admin account
python manage.py shell
```

For scheduled syncing, `data_manipulation/scheduler.py` can run these jobs in-process.
## Development Status

This project is currently under active development as part of a Software Engineering course.

Current progress includes:
- Software Requirements Specification
- UML diagrams
- System architecture
- Flask API simulator for local development
- Backend development
- Frontend development

## About the deployed version
### Forget password
for now the forget password in not working, but since the project is going to be build and introduced to people in charge to this solution.

### logins for deployed version
> All test users share the same default password: `Passw0rd!2026`

| Role | Email Format | Scope | Example |
| :--- | :--- | :--- | :--- |
| **Chief Ombudsman** | `chief@permitwatch.rw` | National | `chief@permitwatch.rw` |
| **Deputy Ombudsman** | `deputy@permitwatch.rw` | National | `deputy@permitwatch.rw` |
| **Monitoring Officer** | `office.<district_name>@permitwatch.rw` | District-Specific | `office.gasabo@permitwatch.rw` |

## Team

Developed by:
- Irené ISHAMI

## License

This project is developed for educational purposes.
