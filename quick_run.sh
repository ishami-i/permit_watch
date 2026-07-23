#!/usr/bin/env bash
# Quick-run script for the permit_watch Django backend.
#
# Usage:
#   ./run.sh              # setup + migrate + start dev server
#   ./run.sh sync         # setup + migrate + sync permits from the API
#   ./run.sh sync 100     # ...with a custom --count
#   ./run.sh shell        # setup + migrate + open Django shell
#   ./run.sh fresh        # wipe db.sqlite3 and re-migrate before running
#
# Place this file in the backend/ directory (next to manage.py).

set -euo pipefail
cd "$(dirname "$0")"

VENV_DIR=".venv"
PYTHON_BIN="python3"

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
    pip install -q django python-dotenv requests djangorestframework
fi

# --- 3. .env -------------------------------------------------------------
if [ ! -f ".env" ]; then
    echo "==> Creating default .env (edit as needed)..."
    cat > .env <<'EOF'
DJANGO_SECRET_KEY=django-insecure-change-me
PERMIT_API_URL=http://127.0.0.1:5000/api/permits
EOF
fi

# --- 4. optional fresh reset ----------------------------------------------
MODE="${1:-run}"

if [ "$MODE" = "fresh" ]; then
    echo "==> Removing existing db.sqlite3..."
    rm -f db.sqlite3
    MODE="run"
fi

# --- 5. migrate ------------------------------------------------------------
echo "==> Applying migrations..."
python manage.py migrate

# --- 6. dispatch -----------------------------------------------------------
case "$MODE" in
    run)
        echo "==> Starting dev server at http://127.0.0.1:8000 ..."
        python manage.py runserver
        ;;
    sync)
        COUNT="${2:-40}"
        echo "==> Syncing $COUNT permits from the external API..."
        python manage.py sync_permits --count "$COUNT"
        ;;
    shell)
        echo "==> Opening Django shell..."
        python manage.py shell
        ;;
    *)
        echo "Unknown mode: $MODE"
        echo "Usage: ./run.sh [run|sync [count]|shell|fresh]"
        exit 1
        ;;
esac