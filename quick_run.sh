#!/bin/bash

# Quick Start / Deploy Script for PermitWatch Rwanda Platform
# Sets up and runs the entire stack — API simulator, Django backend, and a
# production frontend build — in a single pass. Meant to be run directly on
# the server (or from a deploy pipeline) with nginx sitting in front of it.

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🏗️   PermitWatch Rwanda — Quick Start / Deploy   🏗️       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step()    { echo -e "${BLUE}➜${NC} $1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error()   { echo -e "${RED}✗${NC} $1"; }

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
API_DIR="$ROOT_DIR/api_simulation"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
VENV_DIR="$ROOT_DIR/.venv"
LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/.api_simulator.pid"

API_PORT="${API_PORT:-5000}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
APP_NAME="data_manipulation"

API_PID=""

cleanup() {
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        echo ""
        print_step "Stopping API simulator (pid $API_PID)..."
        kill "$API_PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
}
trap cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# Shared virtual environment (one venv for the whole project)
# ---------------------------------------------------------------------------

if [ ! -d "$VENV_DIR" ]; then
    print_step "Creating shared virtual environment..."
    python3 -m venv "$VENV_DIR"
    print_success "Virtual environment created at .venv/"
else
    print_success "Virtual environment found"
fi

print_step "Activating virtual environment..."
# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"
print_success "Virtual environment activated"

print_step "Checking Python dependencies..."
pip install --upgrade pip --quiet
if [ -f "$ROOT_DIR/requirements.txt" ]; then
    pip install -r "$ROOT_DIR/requirements.txt" --quiet
    print_success "Python dependencies installed"
else
    print_warning "No requirements.txt found at project root, skipping"
fi

# ---------------------------------------------------------------------------
# Logs
# ---------------------------------------------------------------------------

if [ ! -d "$LOG_DIR" ]; then
    print_step "Creating logs directory..."
    mkdir -p "$LOG_DIR"
    touch "$LOG_DIR/api_simulation.log" "$LOG_DIR/backend.log"
    chmod 755 "$LOG_DIR"
    print_success "Logs directory created"
else
    print_success "Logs directory exists"
fi

# ---------------------------------------------------------------------------
# backend/.env
# ---------------------------------------------------------------------------

if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning "backend/.env not found, creating one..."
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        print_success "backend/.env created from .env.example (please review it)"
    else
        cat > "$BACKEND_DIR/.env" << EOF
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
PERMIT_API_URL=http://127.0.0.1:${API_PORT}/api/permits
EOF
        print_success "Minimal backend/.env created — please review it, especially ALLOWED_HOSTS"
    fi
else
    print_success "backend/.env exists"
fi

# ---------------------------------------------------------------------------
# Database + migrations
# ---------------------------------------------------------------------------

print_step "Applying database migrations..."
(
    cd "$BACKEND_DIR"
    python manage.py makemigrations "$APP_NAME" --noinput
    python manage.py migrate --noinput
)
print_success "Database up to date"

# ---------------------------------------------------------------------------
# Static files (nginx serves these directly)
# ---------------------------------------------------------------------------

print_step "Collecting static files..."
(
    cd "$BACKEND_DIR"
    python manage.py collectstatic --noinput --clear > /dev/null 2>&1
)
print_success "Static files collected"

# ---------------------------------------------------------------------------
# Frontend build (nginx serves frontend/dist directly)
# ---------------------------------------------------------------------------

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_step "Installing frontend packages..."
    (
        cd "$FRONTEND_DIR"
        npm install --legacy-peer-deps --silent
    )
    print_success "Frontend packages installed"
else
    print_success "Frontend packages found"
fi

print_step "Building frontend for production..."
(
    cd "$FRONTEND_DIR"
    npm run build --silent
)
print_success "Frontend built to frontend/dist"

# ---------------------------------------------------------------------------
# Start the API simulator in the background
# ---------------------------------------------------------------------------

print_step "Starting API simulator on port $API_PORT..."
(
    cd "$API_DIR"
    nohup python api_server.py >> "$LOG_DIR/api_simulation.log" 2>&1 &
    echo $! > "$PID_FILE"
)
sleep 1
API_PID="$(cat "$PID_FILE" 2>/dev/null || true)"

if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
    print_success "API simulator running (pid $API_PID, logs at logs/api_simulation.log)"
else
    print_error "API simulator failed to start — check logs/api_simulation.log"
    API_PID=""
fi

# ---------------------------------------------------------------------------
# Start the backend in the foreground
# ---------------------------------------------------------------------------

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✨ Setup Complete! ✨                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Access points (nginx should sit in front of these):"
echo "   🌐 Frontend build:   frontend/dist/          (nginx serves as static files)"
echo "   🔌 Django backend:   http://127.0.0.1:${BACKEND_PORT}/"
echo "   👨‍💼 Admin panel:      http://127.0.0.1:${BACKEND_PORT}/admin/"
echo "   🧪 API simulator:    http://127.0.0.1:${API_PORT}/  (internal only, not for nginx)"
echo ""
echo "📚 Docs: README.md · backend.md · api_documentation.md · frontend.md · synchronisation.md"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the backend and the API simulator${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

cd "$BACKEND_DIR"

if command -v gunicorn >/dev/null 2>&1; then
    print_step "Starting Django backend with gunicorn on 127.0.0.1:${BACKEND_PORT}..."
    gunicorn config.wsgi:application \
        --bind "127.0.0.1:${BACKEND_PORT}" \
        --access-logfile "$LOG_DIR/backend.log" \
        --error-logfile "$LOG_DIR/backend.log"
else
    print_warning "gunicorn not installed — falling back to 'manage.py runserver'."
    print_warning "Add 'gunicorn' to requirements.txt before deploying behind nginx."
    python manage.py runserver "0.0.0.0:${BACKEND_PORT}"
fi