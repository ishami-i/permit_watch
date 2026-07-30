# Deployment Guide

This covers taking PermitWatch from a fresh Linux server to a running
deployment behind nginx, using [`quick_run.sh`](../quick_run.sh) as the
setup/start mechanism. For what the script actually does, see the root
[`README.md`](README.md#quick-start); for backend internals see
[`backend.md`](backend.md).

## 1. Prerequisites

Tested against Ubuntu/Debian; adjust package names for other distros.

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip \
                     nodejs npm \
                     nginx \
                     git
```

- Python 3.10+ and Node.js 18+ are assumed. Check versions:
  ```bash
  python3 --version
  node --version
  npm --version
  ```
- `gunicorn` is installed automatically as part of `requirements.txt` when
  `quick_run.sh` runs — confirm it's actually listed there before deploying
  (see `backend.md` §2); without it the script falls back to
  `manage.py runserver`, which is not meant to serve production traffic.

## 2. Get the code onto the server

```bash
git clone https://github.com/ishami-i/permit_watch.git
cd permit_watch
```

Run everything below as a dedicated non-root user with write access to
this directory (e.g. a `deploy` user), not as `root`.

## 3. First run

```bash
chmod +x quick_run.sh
./quick_run.sh
```

This is safe to run interactively first, to confirm the venv, migrations,
`backend/.env`, `collectstatic`, and the frontend build all complete
without errors before wiring it into systemd. It will sit in the
foreground serving the backend — `Ctrl+C` to stop once you've confirmed
it's healthy.

Review `backend/.env` afterwards, particularly:

- `ALLOWED_HOSTS` — must include your real domain/IP, not just
  `localhost,127.0.0.1`
- `DEBUG` — should stay `False`
- `PERMIT_API_URL` — only needs to change if you're pointing at a real
  permit API instead of the bundled simulator

See `backend.md` §4 for the full variable reference.

## 4. Run it as a service (systemd)

Running `quick_run.sh` in a terminal is fine for testing, but a real
deployment should survive reboots and SSH disconnects. Since the script
already handles setup idempotently and cleans up the background API
simulator on `SIGTERM`, the simplest approach is to let systemd manage the
script itself:

```ini
# /etc/systemd/system/permitwatch.service
[Unit]
Description=PermitWatch (API simulator + Django backend)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/path/to/permit_watch
ExecStart=/path/to/permit_watch/quick_run.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now permitwatch
sudo systemctl status permitwatch
```

`systemctl stop permitwatch` sends `SIGTERM`, which the script's `trap`
uses to shut down the API simulator alongside gunicorn — see the trap in
`quick_run.sh`.

Logs:

```bash
journalctl -u permitwatch -f      # stdout/stderr from the script itself
tail -f logs/backend.log          # gunicorn access/error log
tail -f logs/api_simulation.log   # Flask simulator log
```

## 5. nginx

Point nginx at the built frontend, the Django backend, and Django's static
files. The API simulator (port 5000) should **never** be exposed here —
it's only reached internally by the backend via `PERMIT_API_URL`.

```nginx
# /etc/nginx/sites-available/permitwatch
server {
    listen 80;
    server_name your-domain.example;

    root /path/to/permit_watch/frontend/dist;
    index index.html;

    # React Router — serve index.html for unknown paths
    location / {
        try_files $uri /index.html;
    }

    location /static/ {
        alias /path/to/permit_watch/backend/staticfiles/;  # match STATIC_ROOT in config/settings.py
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/permitwatch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Adjust the `/static/` alias path to whatever `STATIC_ROOT` is actually set
to in `backend/config/settings.py`, and adjust `/api/` / `/admin/` to match
the real URL prefixes in `backend/config/urls.py` and
`data_manipulation/urls.py`.

## 6. HTTPS

Once DNS is pointed at the server and the plain-HTTP config above is
confirmed working, issue a certificate with certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

Certbot rewrites the nginx server block to redirect HTTP → HTTPS and sets
up auto-renewal.

## 7. Firewall

Only nginx's ports need to be reachable from outside:

```bash
sudo ufw allow 'Nginx Full'   # 80 + 443
sudo ufw enable
```

Ports `8000` (Django) and `5000` (API simulator) should stay bound to
`127.0.0.1` — which is what `quick_run.sh` already does — and not be
opened in the firewall.

## 8. Redeploying updates

```bash
cd /path/to/permit_watch
git pull
sudo systemctl restart permitwatch
```

`quick_run.sh` re-installs dependencies, reapplies migrations,
re-collects static files, and rebuilds the frontend on every start, so a
restart is enough to pick up new code. If you changed nginx config (new
routes, static path, etc.), also `sudo systemctl reload nginx`.

## 9. Troubleshooting

| Symptom | Check |
|---|---|
| systemd service won't start | `journalctl -u permitwatch -e`, and confirm the `deploy` user can write to the repo directory and `logs/` |
| `502 Bad Gateway` from nginx | Is `permitwatch.service` actually running? `sudo systemctl status permitwatch`; confirm gunicorn is bound to `127.0.0.1:8000` |
| Frontend shows old content after deploy | Confirm `npm run build` actually ran (check `frontend/dist` mtime) and that nginx's `root` points at `frontend/dist`, not `frontend/` |
| "gunicorn not installed" warning in logs | Add `gunicorn` to `requirements.txt` and restart the service |
| Static files 404 | Confirm the nginx `/static/` alias matches `STATIC_ROOT` in `config/settings.py`, and that `collectstatic` actually ran |

## 10. Related documentation

- [`README.md`](README.md) — what `quick_run.sh` does step by step
- [`backend.md`](backend.md) — backend structure and configuration
- [`api_documentation.md`](api_documentation.md) — the internal-only API
  simulator this deployment relies on unless you swap in a real permit API