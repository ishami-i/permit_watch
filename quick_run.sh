#!/bin/bash

<<<<<<< HEAD
# PermitWatch Rwanda - Quick Start (Deployment Script version)
set -Eeuo pipefail

# Colors
=======
###############################################################################
# PermitWatch Rwanda - Quick Start / Deployment Script
###############################################################################

set -Eeuo pipefail

################################################################################
# Colors
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step()    { echo -e "${BLUE}➜${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }

<<<<<<< HEAD
# Banner
=======
################################################################################
# Banner
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
echo
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║               PermitWatch Rwanda Deployment                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo

<<<<<<< HEAD
# Directories
=======
################################################################################
# Directories
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
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

<<<<<<< HEAD
# Cleanup
=======
################################################################################
# Cleanup
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
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

<<<<<<< HEAD
# Detect Python
print_step "Locating Python..."

=======
################################################################################
# Detect Python
################################################################################

print_step "Locating Python..."

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
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

<<<<<<< HEAD
# Virtual Environment
=======
################################################################################
# Virtual Environment
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
if [[ ! -f "$VENV_DIR/bin/activate" ]]; then

    print_warning "Virtual environment missing."

    rm -rf "$VENV_DIR"

    print_step "Creating virtual environment..."

    "$PYTHON" -m venv "$VENV_DIR"

fi

print_step "Activating virtual environment..."

source "$VENV_DIR/bin/activate"

print_success "Virtual environment activated."

<<<<<<< HEAD
# Upgrade pip
=======
################################################################################
# Upgrade pip
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
print_step "Upgrading pip..."

python -m pip install --upgrade pip setuptools wheel

<<<<<<< HEAD
# Python Packages
=======
################################################################################
# Python Packages
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
if [[ -f "$ROOT_DIR/requirements.txt" ]]; then

    print_step "Installing Python packages..."

    pip install -r "$ROOT_DIR/requirements.txt"

fi

<<<<<<< HEAD
# Logs
mkdir -p "$LOG_DIR"

touch \
"$LOG_DIR/api_simulation.log" \
"$LOG_DIR/backend.log"

# Backend .env
=======
################################################################################
# Logs
################################################################################

mkdir -p "$LOG_DIR"

touch \
"$LOG_DIR/api_simulation.log" \
"$LOG_DIR/backend.log"

################################################################################
# Backend .env
################################################################################

>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
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

<<<<<<< HEAD
# Django
=======
################################################################################
# Django
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

cd "$BACKEND_DIR"

print_step "Running migrations..."

python manage.py makemigrations "$APP_NAME" --noinput

python manage.py migrate --noinput

print_success "Database ready."

<<<<<<< HEAD
# Static
=======
################################################################################
# Static
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

print_step "Collecting static files..."

python manage.py collectstatic --noinput --clear

print_success "Static files collected."

<<<<<<< HEAD
# Frontend
=======
################################################################################
# Frontend
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

cd "$FRONTEND_DIR"

if [[ ! -d dist ]]; then

    print_error "Frontend build not found."
    print_error "Run 'npm install && npm run build' locally."
    print_error "Then upload frontend/dist to the server."

    exit 1

fi

print_success "Using prebuilt frontend."

<<<<<<< HEAD
# API Simulator
=======
################################################################################
# API Simulator
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

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

<<<<<<< HEAD
# Test API
=======
################################################################################
# Test API
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

if command -v curl >/dev/null 2>&1; then

    print_step "Testing simulator..."

    if curl -fs "http://127.0.0.1:${API_PORT}/api/permits?count=1" >/dev/null; then

        print_success "Simulator responding."

    else

        print_warning "Simulator did not respond."

    fi

fi

<<<<<<< HEAD
# Summary
=======
################################################################################
# Summary
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

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

<<<<<<< HEAD
# Start Backend
=======
################################################################################
# Start Backend
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

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

<<<<<<< HEAD
# Cleanup
=======
################################################################################
# Cleanup
################################################################################
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64

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

<<<<<<< HEAD
trap cleanup SIGTERM SIGINT EXIT
=======
trap cleanup SIGTERM SIGINT EXIT
>>>>>>> 1c7a7fb9485c1f6f1bdee942253d1e0b6575ac64
