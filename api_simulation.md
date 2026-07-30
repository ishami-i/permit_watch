# API Simulation — Design Notes

This system is based on the Kubaka system, which we don't have access to.
To build PermitWatch without it, this directory simulates how that API
would behave if it were available.

For the actual request/response reference (endpoints, query parameters,
the full permit object shape, error responses), see
[`api_documentation.md`](api_documentation.md). This file just covers how
the simulator itself is put together.

## How it's built

A Flask app (`api_server.py` + `routes.py`) generates realistic, internally
consistent permit records on demand — applicants, professionals
(engineer/architect/surveyor), property/zoning data, project financials,
and a supervisor — rather than replaying a fixed fixture file. Each request
to `/api/permits` produces a fresh batch, so the backend's sync subsystem
(see [`synchronisation.md`](synchronisation.md)) has a continuous, varied
data source to pull from during development.

## File structure

```
api_simulation/
├── api_server.py
├── routes.py
├── data_generator/
│   ├── __init__.py
│   ├── applicant.py
│   ├── permit.py
│   ├── professional.py
│   ├── project.py
│   ├── property.py
│   └── supervisor.py
└── sample_data/
    ├── location.json
    ├── names.json
    └── supervisors.json
```

## Running it

Uses the same shared `.venv` at the repo root as the Django backend — no
separate environment to manage:

```bash
source .venv/bin/activate   # from the repo root
pip install -r requirements.txt
python api_simulation/api_server.py
```

`requirements.txt` lives at the repo root and is shared with the Django
backend — there's nothing to install from inside `api_simulation/` itself.

Or, to bring it up along with the rest of the stack, run `quick_run.sh` at
the repo root — it starts this simulator in the background automatically.

See [`api_documentation.md`](api_documentation.md#running-the-server) for
the `HOST` / `PORT` / `FLASK_DEBUG` environment variables it accepts.