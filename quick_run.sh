#!/usr/bin/env bash

set -euo pipefail

###############################################################################
# Permit Watch Development Runner
#
# Starts:
#   - Flask API simulator (5000)
#   - Django backend (8000)
#   - React/Vite frontend (5173)
###############################################################################

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

API_DIR="$ROOT_DIR/api_simulation"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

VENV_DIR="$ROOT_DIR/.venv"

PYTHON_BIN=python3
API_PORT=5000
BACKEND_PORT=8000
APP_NAME=data_manipulation

PIDS=()

###############################################################################
# cleanup
###############################################################################

cleanup() {
    echo

    if [ "${#PIDS[@]}" -gt 0 ]; then
        echo "==> Stopping background services..."

        for pid in "${PIDS[@]}"; do
            kill "$pid" 2>/dev/null || true
        done

        wait 2>/dev/null || true
    fi
}

trap cleanup EXIT INT TERM

###############################################################################
# help
###############################################################################

usage() {

cat <<EOF

Permit Watch Development Runner

Usage:

./quick_run.sh
./quick_run.sh run
./quick_run.sh backend
./quick_run.sh api
./quick_run.sh frontend
./quick_run.sh sync [count]
./quick_run.sh sync-loop [count] [interval]
./quick_run.sh flag [--refresh]
./quick_run.sh shell
./quick_run.sh createsuperuser
./quick_run.sh fresh

EOF

}

MODE="${1:-run}"
shift || true

if [[ "$MODE" == "-h" || "$MODE" == "--help" ]]; then
    usage
    exit 0
fi

###############################################################################
# prerequisites
###############################################################################

command -v "$PYTHON_BIN" >/dev/null || {
    echo "Python3 not installed."
    exit 1
}

command -v npm >/dev/null || {
    echo "npm is not installed."
    exit 1
}

###############################################################################
# venv
###############################################################################

if [ ! -d "$VENV_DIR" ]; then
    echo "==> Creating virtual environment..."
    "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"

###############################################################################
# install python dependencies
###############################################################################

echo "==> Installing Python dependencies..."

python -m pip install --upgrade pip

if [ -f "$ROOT_DIR/requirements.txt" ]; then
    pip install -r "$ROOT_DIR/requirements.txt"
fi

###############################################################################
# backend env
###############################################################################

if [ ! -f "$BACKEND_DIR/.env" ]; then

cat > "$BACKEND_DIR/.env" <<EOF
DJANGO_SECRET_KEY=django-insecure-change-me
PERMIT_API_URL=http://127.0.0.1:5000/api/permits
EOF

fi

###############################################################################
# migrations
###############################################################################

echo "==> Running migrations..."

(
cd "$BACKEND_DIR"

python manage.py makemigrations "$APP_NAME"
python manage.py migrate

)

###############################################################################
# helper functions
###############################################################################

port_in_use() {

python - <<END
import socket

s=socket.socket()

print(
0 if s.connect_ex(("127.0.0.1",$1))==0 else 1
)
END

}

wait_for_port() {

PORT=$1

for i in {1..30}; do

python - <<END
import socket
import sys

s=socket.socket()

sys.exit(
0 if s.connect_ex(("127.0.0.1",$PORT))==0 else 1
)
END

if [ $? -eq 0 ]; then
return
fi

sleep .25

done

echo "Timed out waiting for port $PORT"

}

###############################################################################
# start api
###############################################################################

start_api(){

if lsof -i :"$API_PORT" >/dev/null 2>&1
then
echo "==> API simulator already running."
return
fi

echo "==> Starting API simulator..."

(
cd "$API_DIR"
python api_server.py
) &

PIDS+=($!)

wait_for_port "$API_PORT"

}

###############################################################################
# frontend
###############################################################################

start_frontend(){

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then

echo "==> Installing frontend packages..."

(
cd "$FRONTEND_DIR"

npm install --legacy-peer-deps

)

fi

echo "==> Starting Vite..."

(
cd "$FRONTEND_DIR"

npm run dev

)&

PIDS+=($!)

}

###############################################################################
# dispatch
###############################################################################

case "$MODE" in

run)

start_api

start_frontend

echo
echo "==> Starting Django..."

cd "$BACKEND_DIR"

python manage.py runserver "$BACKEND_PORT"

;;

backend)

cd "$BACKEND_DIR"

python manage.py runserver "$BACKEND_PORT"

;;

api)

cd "$API_DIR"

python api_server.py

;;

frontend)

start_frontend

wait

;;

sync)

COUNT="${1:-100}"

start_api

cd "$BACKEND_DIR"

python manage.py sync_permits --count "$COUNT"

;;

sync-loop)

COUNT="${1:-100}"

INTERVAL="${2:-300}"

start_api

while true
do

cd "$BACKEND_DIR"

python manage.py sync_permits --count "$COUNT"

sleep "$INTERVAL"

done

;;

flag)

REFRESH=""

if [[ "${1:-}" == "--refresh" ]]; then
REFRESH="--refresh"
fi

cd "$BACKEND_DIR"

python manage.py flag_permits $REFRESH

;;

shell)

cd "$BACKEND_DIR"

python manage.py shell

;;

createsuperuser)

cd "$BACKEND_DIR"

python manage.py createsuperuser

;;

fresh)

echo "Removing database..."

rm -f "$BACKEND_DIR/db.sqlite3"

find "$BACKEND_DIR/$APP_NAME/migrations" \
-type f \
-name "*.py" \
! -name "__init__.py" \
-delete

cd "$BACKEND_DIR"

python manage.py makemigrations "$APP_NAME"

python manage.py migrate

;;

*)

usage

exit 1

;;

esac