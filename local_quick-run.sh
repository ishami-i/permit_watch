#!/bin/bash

# PermitWatch Rwanda - Local Development Script
# Starts:
#   - API Simulator (Flask)
#   - Django Backend
#   - React/Vite Frontend
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🏗️ PermitWatch Rwanda - Local Development 🏗️      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

API_PORT=5000
BACKEND_PORT=8000
FRONTEND_PORT=5173

APP_NAME="data_manipulation"

API_PID=""
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    print_step "Stopping services..."

    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        kill "$API_PID"
    fi

    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
    fi

    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
    fi

    print_success "All services stopped."
}

trap cleanup EXIT INT TERM

if [ ! -d "$VENV_DIR" ]; then
    print_step "Creating shared virtual environment at .venv..."
    python3 -m venv "$VENV_DIR"
fi

VENV_PY="$VENV_DIR/bin/python"
VENV_PIP="$VENV_DIR/bin/pip"

# Still activate it too, so any tool invoked interactively (manage.py shell,
# etc.) during this session also sees the same environment on PATH.
source "$VENV_DIR/bin/activate"

print_success "Using shared virtual environment: $VENV_DIR"

# Python dependencies
print_step "Installing Python dependencies..."

"$VENV_PIP" install --upgrade pip

if [ -f "$ROOT_DIR/requirements.txt" ]; then
    "$VENV_PIP" install -r "$ROOT_DIR/requirements.txt"
else
    print_warning "requirements.txt not found."
fi

# Logs
mkdir -p "$LOG_DIR"

touch \
"$LOG_DIR/api_simulation.log" \
"$LOG_DIR/backend.log" \
"$LOG_DIR/frontend.log"

# Backend .env
if [ ! -f "$BACKEND_DIR/.env" ]; then

cat > "$BACKEND_DIR/.env" <<EOF
SECRET_KEY=django-insecure-local-dev-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

PERMIT_API_URL=http://127.0.0.1:${API_PORT}/api/permits
EOF

print_success "Created backend/.env"

fi


# Django migrations
print_step "Running migrations..."

cd "$BACKEND_DIR"

"$VENV_PY" manage.py makemigrations "$APP_NAME"
"$VENV_PY" manage.py migrate

print_success "Database ready"

cd "$ROOT_DIR"

# Frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_step "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install --legacy-peer-deps
    cd "$ROOT_DIR"
fi

# Start API Simulator
print_step "Starting API Simulator..."

cd "$API_DIR"

"$VENV_PY" api_server.py \
> "$LOG_DIR/api_simulation.log" 2>&1 &

API_PID=$!

cd "$ROOT_DIR"

sleep 2

if kill -0 "$API_PID" 2>/dev/null; then
    print_success "API Simulator running (pid $API_PID)."
else
    print_error "API Simulator failed. See logs/api_simulation.log"
    exit 1
fi

# Start Django
print_step "Starting Django Backend..."

cd "$BACKEND_DIR"

"$VENV_PY" manage.py runserver 0.0.0.0:${BACKEND_PORT} \
> "$LOG_DIR/backend.log" 2>&1 &

BACKEND_PID=$!

cd "$ROOT_DIR"

sleep 3

if kill -0 "$BACKEND_PID" 2>/dev/null; then
    print_success "Backend running (pid $BACKEND_PID)."
else
    print_error "Backend failed. See logs/backend.log"
    exit 1
fi

# Start Frontend
print_step "Starting React/Vite..."

cd "$FRONTEND_DIR"

npm run dev -- --host 0.0.0.0 \
> "$LOG_DIR/frontend.log" 2>&1 &

FRONTEND_PID=$!

cd "$ROOT_DIR"

sleep 5

if kill -0 "$FRONTEND_PID" 2>/dev/null; then
    print_success "Frontend running (pid $FRONTEND_PID)."
else
    print_error "Frontend failed. See logs/frontend.log"
    exit 1
fi

# Done
clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              🚀 PermitWatch is Running! 🚀                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "Shared venv"
echo "  $VENV_DIR"
echo ""

echo "Frontend"
echo "  http://localhost:${FRONTEND_PORT}"
echo ""

echo "Backend"
echo "  http://localhost:${BACKEND_PORT}"
echo ""

echo "Admin"
echo "  http://localhost:${BACKEND_PORT}/admin/"
echo ""

echo "API Simulator"
echo "  http://localhost:${API_PORT}"
echo ""

echo "Logs"
echo "  logs/frontend.log"
echo "  logs/backend.log"
echo "  logs/api_simulation.log"
echo ""

echo "Press Ctrl+C to stop all services."
echo ""

# Keep script alive
wait