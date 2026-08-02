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

# Prefer the newest specific interpreter available. Bare `python`/`python3`
# can resolve to whatever the system default is (e.g. Ubuntu's stock 3.8),
# even when a newer version (e.g. via pyenv) is installed and was used to
# build an existing venv. Checking versioned names first avoids silently
# downgrading to an interpreter that can't satisfy requirements.txt.
#
# Also explicitly add common pyenv shim locations to PATH for this lookup.
# Non-interactive contexts (systemd services, cron, etc.) don't source
# ~/.bashrc/~/.profile, so pyenv's PATH additions never happen there even
# though they work fine in an interactive shell -- causing `python3.12` to
# silently resolve to the system interpreter instead. Without this, a venv
# built interactively (correctly, under 3.12) will look "broken" every time
# this script is run under systemd, purely because of a PATH difference,
# not any actual problem with the venv.
for pyenv_root in "$HOME/.pyenv" "/home/ubuntu/.pyenv" "/opt/pyenv"; do
    if [[ -d "$pyenv_root/shims" ]]; then
        PATH="$pyenv_root/shims:$PATH"
    fi
done

PYTHON=""
for candidate in python3.13 python3.12 python3.11 python3.10 python3.9 python3 python; do
    if command -v "$candidate" >/dev/null 2>&1; then
        PYTHON=$(command -v "$candidate")
        break
    fi
done

if [[ -z "$PYTHON" ]]; then
    print_error "Python not found."
    exit 1
fi

print_success "$($PYTHON --version) ($PYTHON)"

# Virtual Environment
if [[ ! -f "$VENV_DIR/bin/activate" ]]; then

    print_warning "Virtual environment missing."

    rm -rf "$VENV_DIR"

    print_step "Creating virtual environment..."

    # --copies: physically copy the interpreter binary into .venv/bin
    # instead of symlinking it. When the interpreter used here is a pyenv
    # shim (a dispatch script, not a real symlink), venv's normal symlink
    # creation can end up pointing bin/python (and even bin/python3.X) at
    # the wrong underlying binary -- e.g. the system Python instead of the
    # pyenv one that was actually selected. Copying removes that ambiguity
    # entirely: whatever is in .venv/bin is guaranteed to be the real thing.
    "$PYTHON" -m venv "$VENV_DIR" --copies

fi

print_step "Activating virtual environment..."

source "$VENV_DIR/bin/activate"

# Always call the venv's own interpreter by absolute path from here on.
# Relying on bare `python`/`pip` after activation is fragile: if the venv
# was built from a python3.X that doesn't drop a plain `python` symlink in
# bin/, PATH lookups for `python` can silently fall back to the system
# interpreter while `pip` (whose shebang hardcodes the venv's python)
# keeps working correctly -- producing exactly this kind of split-brain
# install where pip and python disagree about site-packages.
# Always call the venv's own interpreter by absolute path from here on,
# and prefer the *versioned* binary (e.g. python3.12) over the generic
# `python`/`python3` symlinks. Some venvs end up with `python`/`python3`
# pointing at the system interpreter instead of the one that actually
# built the venv (a known quirk with certain pyenv/venv combinations) --
# the versioned name is the one guaranteed to match what was used to
# install packages.
PY_BASENAME="$(basename "$PYTHON")"
if [[ -x "$VENV_DIR/bin/$PY_BASENAME" ]]; then
    PYVENV="$VENV_DIR/bin/$PY_BASENAME"
else
    PYVENV="$VENV_DIR/bin/python"
fi

if [[ ! -x "$PYVENV" ]]; then
    print_error "Venv python not found at $PYVENV"
    exit 1
fi

print_success "Virtual environment activated ($($PYVENV --version), using $PYVENV)."

# Sanity check: the venv's interpreter should be the same version as the
# one we detected and used to build it. If not, something upstream (venv
# creation, a stray symlink, a pre-existing .venv) is inconsistent -- fail
# loudly here rather than silently installing packages under the wrong
# Python and hitting confusing errors several steps later.
EXPECTED_VER="$($PYTHON -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
ACTUAL_VER="$($PYVENV -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
if [[ "$EXPECTED_VER" != "$ACTUAL_VER" ]]; then
    print_error "Version mismatch: detected Python $EXPECTED_VER but venv is using $ACTUAL_VER ($PYVENV)."
    print_error "Try: rm -rf \"$VENV_DIR\" && rerun this script."
    exit 1
fi

# Upgrade pip
print_step "Upgrading pip..."

"$PYVENV" -m pip install --upgrade pip setuptools wheel

# Python Packages
if [[ -f "$ROOT_DIR/requirements.txt" ]]; then

    print_step "Installing Python packages..."

    "$PYVENV" -m pip install -r "$ROOT_DIR/requirements.txt"

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
SECRET_KEY=$("$PYVENV" - <<PY
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

"$PYVENV" manage.py makemigrations "$APP_NAME" --noinput

"$PYVENV" manage.py migrate --noinput

print_success "Database ready."

# Static

print_step "Collecting static files..."

"$PYVENV" manage.py collectstatic --noinput --clear

print_success "Static files collected."

# Frontend

cd "$FRONTEND_DIR"

SKIP_FRONTEND_BUILD="${SKIP_FRONTEND_BUILD:-0}"

if [[ "$SKIP_FRONTEND_BUILD" != "1" ]]; then

    if ! command -v npm >/dev/null 2>&1; then

        print_error "npm not found, cannot build frontend."
        print_error "Install Node/npm, or set SKIP_FRONTEND_BUILD=1 to reuse an existing frontend/dist."

        exit 1

    fi

    print_step "Installing frontend dependencies..."

    npm install

    print_step "Building frontend..."

    npm run build

    print_success "Frontend build complete."

else

    print_warning "SKIP_FRONTEND_BUILD=1 set, reusing existing frontend/dist without rebuilding."

fi

if [[ ! -d dist ]]; then

    print_error "Frontend build not found."
    print_error "Run 'npm install && npm run build' locally."
    print_error "Then upload frontend/dist to the server."

    exit 1

fi

print_success "Using frontend build."

# API Simulator

cd "$API_DIR"

print_step "Starting API simulator..."

nohup "$PYVENV" api_server.py \
>> "$LOG_DIR/api_simulation.log" 2>&1 &

# Capture the PID directly into a variable rather than round-tripping it
# through the PID file. Re-reading the file a few seconds later (via
# `PID=$(cat "$PID_FILE")`) is an unnecessary dependency: if that read
# ever fails for any reason, the command substitution's failure trips
# `set -e` and kills the whole script with no diagnostic output at all --
# which is exactly the silent death this replaces. The file is still
# written, for `cleanup()` and any future manual inspection, but liveness
# checks below no longer depend on it existing or being readable.
API_PID=$!
echo "$API_PID" > "$PID_FILE"

sleep 3

if [[ ! -f "$PID_FILE" ]]; then
    print_warning "PID file $PID_FILE unexpectedly missing after write (continuing anyway, using in-memory PID $API_PID)."
fi

if ! kill -0 "$API_PID" 2>/dev/null; then

    print_error "API simulator crashed (PID $API_PID)."

    tail -n 50 "$LOG_DIR/api_simulation.log"

    exit 1

fi

print_success "API simulator running (PID $API_PID)."

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

    exec "$PYVENV" manage.py runserver 0.0.0.0:${BACKEND_PORT}

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