#!/usr/bin/env bash
# Quick-run script for the permit_watch Django backend.
#
# Usage:
#   ./run.sh                    setup + migrate + start dev server
#   ./run.sh sync [count]       setup + migrate + sync permits from the API (default count: 40)
#   ./run.sh flag [--refresh]   setup + migrate + evaluate/persist flagged-permit Alerts
#   ./run.sh shell               setup + migrate + open Django shell
#   ./run.sh createsuperuser     setup + migrate + create a Django admin/superuser
#   ./run.sh fresh                wipe db.sqlite3 AND stale migrations, then start the dev server
#   ./run.sh -h | --help          show this help
#
# Place this file in the backend/ directory (next to manage.py).

set -euo pipefail
cd "$(dirname "$0")"

VENV_DIR=".venv"
PYTHON_BIN="python3"
APP_NAME="data_manipulation"

usage() {
    sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
    usage
    exit 0
fi

# --- 0. sanity checks ------------------------------------------------------
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
    echo "ERROR: $PYTHON_BIN not found on PATH. Install Python 3 and try again." >&2
    exit 1
fi

if [ ! -f "manage.py" ]; then
    echo "ERROR: manage.py not found. Run this script from (or place it in) the backend/ directory." >&2
    exit 1
fi

# --- 1. venv -----------------------------------------------------------
if [ ! -d "$VENV_DIR" ]; then
    echo "==> Creating virtual environment ($VENV_DIR)..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

# --- 2. dependencies -----------------------------------------------------
if [ -f "requirements.txt" ]; then
    echo "==> Installing dependencies from requirements.txt..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
else
    echo "==> No requirements.txt found, installing minimal set..."
    pip install -q --upgrade pip
    pip install -q django python-dotenv requests djangorestframework djangorestframework-simplejwt django-cors-headers
fi

# --- 3. .env -------------------------------------------------------------
if [ ! -f ".env" ]; then
    echo "==> Creating default .env (edit as needed)..."
    cat > .env <<'EOF'
DJANGO_SECRET_KEY=django-insecure-change-me
PERMIT_API_URL=http://127.0.0.1:5000/api/permits
EOF
fi

# --- 4. mode / args --------------------------------------------------------
MODE="${1:-run}"
shift || true

# --- 5. optional fresh reset ----------------------------------------------
if [ "$MODE" = "fresh" ]; then
    echo "==> [fresh] Removing db.sqlite3 and stale migrations for '$APP_NAME'..."
    read -r -p "This deletes your local database and migration files. Continue? [y/N] " CONFIRM
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
    rm -f db.sqlite3
    find "$APP_NAME/migrations" -type f -name "*.py" ! -name "__init__.py" -delete
    echo "==> Regenerating migrations..."
    python manage.py makemigrations
    MODE="run"
fi

# --- 6. makemigrations + migrate -------------------------------------------
echo "==> Checking for model changes..."
python manage.py makemigrations "$APP_NAME" --check --dry-run >/dev/null 2>&1 || {
    echo "==> Model changes detected, generating migrations..."
    python manage.py makemigrations "$APP_NAME"
}

echo "==> Applying migrations..."
python manage.py migrate

# --- 7. dispatch -----------------------------------------------------------
case "$MODE" in
    run)
        echo "==> Starting dev server at http://127.0.0.1:8000 ..."
        python manage.py runserver
        ;;
    sync)
        COUNT="${1:-40}"
        echo "==> Syncing $COUNT permits from the external API..."
        python manage.py sync_permits --count "$COUNT"
        ;;
    flag)
        REFRESH_FLAG=""
        if [[ "${1:-}" == "--refresh" ]]; then
            REFRESH_FLAG="--refresh"
        fi
        echo "==> Evaluating permits against flagging rules..."
        python manage.py flag_permits $REFRESH_FLAG
        ;;
    shell)
        echo "==> Opening Django shell..."
        python manage.py shell
        ;;
    createsuperuser)
        echo "==> Creating a superuser..."
        python manage.py createsuperuser
        ;;
    *)
        echo "Unknown mode: $MODE" >&2
        usage
        exit 1
        ;;
esac