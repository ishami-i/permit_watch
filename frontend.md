# Permit Watch — Office of the Ombudsman

Refactored/completed build based on the original architecture plan and code dump.

## Setup

Development:

```bash
npm install
npm run dev
```

Production (this is what `quick_run.sh` runs at the repo root):

```bash
npm install --legacy-peer-deps
npm run build   # outputs to dist/, which nginx serves as static files
```

The build reads `API_BASE_URL` from `src/config.js` — point it at the
deployed Django backend's URL before building for production. See the root
[`README.md`](README.md#nginx) for how nginx is expected to serve `dist/`
alongside the backend.

Add your logo at `public/logo.png` (referenced by Header, AuthLayout, ErrorLayout).

## What was fixed from the original code

- **`services/permitService.js`** — imported constants from `"../"` instead of
  `"../config"`, and called an undefined `axios` object instead of the `api`
  instance it had actually imported. Both fixed; all requests now go through
  the shared instance with the auth interceptor.
- **`components/CreateMonitoringOfficer.jsx`** — had two `import React` lines,
  and did `import { locations } from "../data/locations.json"` (a named
  import of a file whose only export is the default). Rebuilt as
  `CreateMonitoringOfficerForm`, using a proper default import and the new
  `monitoringService.createMonitoringOfficer`.
- **Two axios instances** (`api/api.js` and `api/axios.js`) that duplicated
  each other — consolidated into a single `api/axios.js` with both request
  (auth token) and response (401 → redirect to login) interceptors.
- **Two conflicting CSS variable systems** — one file used
  `--bg-page`/`--text-primary`, everything else used
  `--background-50`/`--text-900`. Standardized on the numeric scale in
  `src/styles/theme.css` since that's what most components already used, and
  removed the unused Vite-template boilerplate CSS (`.hero`, `.ticks`, etc.).
- **`tailwind.config.js`** — had no `content` field, so Tailwind wasn't
  scanning any files; fixed and wired to the theme's CSS variables.
- **No routing at all** — `App.jsx` was a static shell with a `{/* Your
  pages */}` comment despite `BrowserRouter` already being set up in
  `main.jsx`. Built out full routing in `App.jsx` with role-based guards.
- **`pages/` had a broken index file** importing `Listing` and `Alerted` as
  named exports from components that use default exports, and neither
  `Alerted` nor a matching page component existed. Replaced by the actual
  page components below.
- Missing entirely: `package.json`, `vite.config.js`, `postcss.config.js`,
  `index.html`, auth flow (`AuthContext`, `authService`, login/logout,
  protected routes), and nearly all pages/services from the original plan.

## Structure

```
src/
  api/axios.js            single axios instance (auth header + 401 handling)
  config.js                all API endpoint constants
  context/AuthContext.jsx  current user, login/logout
  layouts/                 DashboardLayout, MonitoringLayout, AuthLayout,
                            PublicLayout, ErrorLayout, RoleLayout (picks
                            Dashboard vs Monitoring layout by role)
  components/
    common/                 Header, Footer, Sidebar, CompactSidebar,
                             ProtectedRoute, Modal, Pagination, SearchBar,
                             FilterBar, Breadcrumb, StatusBadge, Loading,
                             EmptyState, ErrorState, LocationFilters
    dashboard/ charts/ permits/ monitoring/ alerts/
  pages/                    one folder per module, matching the original plan
  services/                 one file per resource, all going through api/axios.js
  data/locations.json       Rwanda province → district → sector data
```

## Roles

- `chief_ombudsman` / `deputy_ombudsman` — full `DashboardLayout`, access to
  Monitoring, Users, Settings.
- `monitoring_officer` — simplified `MonitoringLayout`, scoped to
  dashboard/permits/alerts/profile.

`ProtectedRoute` (in `components/common/`) reads the role from `AuthContext`
and redirects unauthenticated users to `/login`, or unauthorized ones to
`/unauthorized`. See [`backend.md`](backend.md#9-roles) — the backend needs
to enforce these same roles server-side, not just in the frontend's route
guards.

## Backend contract

Every service function assumes a JSON REST API at `VITE`-style
`API_BASE_URL` (see `src/config.js`) returning the shapes consumed by each
page (e.g. `getDashboardSummary()` expects `total_permits`,
`permits_by_province`, `recent_permits`, etc. — see
`pages/Dashboard/Dashboard.jsx` for the full shape). Adjust endpoint paths
in `config.js` to match your actual backend. See [`backend.md`](backend.md)
for the Django side of this contract, and
[`api_documentation.md`](api_documentation.md#permit-object) for the shape
of the underlying permit data.