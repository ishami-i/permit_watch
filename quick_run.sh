#!/bin/bash

# PermitWatch Rwanda - Quick Start (Deployment Script version)
set -Eeuo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step()    { echo -e "${BLUE}➜${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }

# Banner

echo
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               PermitWatch Rwanda Deployment                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

# Directories
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

API_DIR="$ROOT_DIR/api_simulation"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

VENV_DIR="$ROOT_DIR/.venv"
LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/.api.pid"

API_PORT="${API_PORT:-5000}"
BACKEND_PORT="${BACKEND_PORT:-8000}"

APP_NAME="data_manipulation"
# Cleanup

cleanup() {

    if [[ -f "$PID_FILE" ]]; then

        PID=$(cat "$PID_FILE")

        if kill -0 "$PID" 2>/dev/null; then
            print_step "Stopping API simulator..."
            kill "$PID" || true
        fi

        rm -f "$PID_FILE"

    fi

}

trap cleanup EXIT INT TERM

# Detect Python
print_step "Locating Python..."

if command -v python >/dev/null 2>&1; then
    PYTHON=$(command -v python)
else
    PYTHON=$(command -v python3)
fi

if [[ -z "$PYTHON" ]]; then
    print_error "Python not found."
    exit 1
fi

print_success "$($PYTHON --version)"


# Virtual Environment
if [[ ! -f "$VENV_DIR/bin/activate" ]]; then

    print_warning "Virtual environment missing."

    rm -rf "$VENV_DIR"

    print_step "Creating virtual environment..."

    "$PYTHON" -m venv "$VENV_DIR"

fi

print_step "Activating virtual environment..."

source "$VENV_DIR/bin/activate"

print_success "Virtual environment activated."

# Upgrade pip
print_step "Upgrading pip..."

python -m pip install --upgrade pip setuptools wheel

# Python Packages
if [[ -f "$ROOT_DIR/requirements.txt" ]]; then

    print_step "Installing Python packages..."

    pip install -r "$ROOT_DIR/requirements.txt"

fi

# Logs
mkdir -p "$LOG_DIR"

touch \
"$LOG_DIR/api_simulation.log" \
"$LOG_DIR/backend.log"

# Backend .env
if [[ ! -f "$BACKEND_DIR/.env" ]]; then

    print_warning ".env missing."

    if [[ -f "$BACKEND_DIR/.env.example" ]]; then

        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"

    else

cat > "$BACKEND_DIR/.env" <<EOF
SECRET_KEY=$(python - <<PY
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
PY
)

DEBUG=False
ALLOWED_HOSTS=*
PERMIT_API_URL=http://127.0.0.1:${API_PORT}/api/permits
EOF

    fi

fi

# Django

cd "$BACKEND_DIR"

print_step "Running migrations..."

python manage.py makemigrations "$APP_NAME" --noinput

python manage.py migrate --noinput

print_success "Database ready."

# Static

print_step "Collecting static files..."

python manage.py collectstatic --noinput --clear

print_success "Static files collected."

# Frontend

cd "$FRONTEND_DIR"

if [[ ! -d dist ]]; then

    print_error "Frontend build not found."
    print_error "Run 'npm install && npm run build' locally."
    print_error "Then upload frontend/dist to the server."

    exit 1

fi

print_success "Using prebuilt frontend."

# API Simulator
cd "$API_DIR"

print_step "Starting API simulator..."

nohup python api_server.py \
>> "$LOG_DIR/api_simulation.log" 2>&1 &

echo $! > "$PID_FILE"

sleep 3

PID=$(cat "$PID_FILE")

if ! kill -0 "$PID" 2>/dev/null; then

    print_error "API simulator crashed."

    cat "$LOG_DIR/api_simulation.log"

    exit 1
fi
print_success "API simulator running."

# Test API

if command -v curl >/dev/null 2>&1; then

    print_step "Testing simulator..."

    if curl -fs "http://127.0.0.1:${API_PORT}/api/permits?count=1" >/dev/null; then

        print_success "Simulator responding."

    else

        print_warning "Simulator did not respond."

    fi

fi

# Summary

echo
echo "=============================================================="
echo "Deployment completed successfully."
echo
echo "Frontend : frontend/dist"
echo "Backend  : http://127.0.0.1:${BACKEND_PORT}"
echo "Admin    : http://127.0.0.1:${BACKEND_PORT}/admin"
echo "API Sim  : http://127.0.0.1:${API_PORT}"
echo "=============================================================="
echo

# Start Backend

cd "$BACKEND_DIR"

if command -v gunicorn >/dev/null 2>&1; then

    print_step "Starting Gunicorn..."

    exec gunicorn config.wsgi:application \
        --bind 127.0.0.1:${BACKEND_PORT} \
        --workers 3 \
        --access-logfile "$LOG_DIR/backend.log" \
        --error-logfile "$LOG_DIR/backend.log"

else

    print_warning "Gunicorn not found."

    exec python manage.py runserver 0.0.0.0:${BACKEND_PORT}

fi

# Cleanup

cleanup() {
    print_step "Stopping API simulator..."

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")

        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            print_success "API simulator stopped."
        fi

        rm -f "$PID_FILE"
    fi
}

trap cleanup SIGTERM SIGINT EXIT
