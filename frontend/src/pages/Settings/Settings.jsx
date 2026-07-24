import { useState } from "react";

const SECTIONS = [
  { key: "general", label: "General" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "security", label: "Security" },
  { key: "api", label: "API" },
  { key: "roles", label: "Roles" },
  { key: "system", label: "System" },
];

function GeneralPanel() {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Organization name</label>
        <input
          defaultValue="Office of the Ombudsman"
          className="w-full max-w-md rounded-md border border-[var(--background-200)] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Default language</label>
        <select className="w-full max-w-md rounded-md border border-[var(--background-200)] px-3 py-2">
          <option>English</option>
          <option>Kinyarwanda</option>
          <option>French</option>
        </select>
      </div>
    </div>
  );
}

function NotificationsPanel() {
  const options = ["New flagged permit", "New alert assigned", "Weekly summary email"];
  return (
    <div className="space-y-3">
      {options.map((label) => (
        <label key={label} className="flex items-center gap-3 text-sm text-[var(--text-900)]">
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--primary-500)]" />
          {label}
        </label>
      ))}
    </div>
  );
}

function AppearancePanel() {
  return (
    <p className="text-sm text-[var(--text-700)]">
      Use the theme toggle in the header (or Ctrl/Cmd + Q) to switch between light and dark mode.
    </p>
  );
}

function SecurityPanel() {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-[var(--text-700)]">Session timeout</label>
        <select className="w-full max-w-md rounded-md border border-[var(--background-200)] px-3 py-2">
          <option>30 minutes</option>
          <option>1 hour</option>
          <option>4 hours</option>
        </select>
      </div>
      <label className="flex items-center gap-3 text-sm text-[var(--text-900)]">
        <input type="checkbox" className="h-4 w-4 accent-[var(--primary-500)]" />
        Require two-factor authentication
      </label>
    </div>
  );
}

function ApiPanel() {
  return (
    <p className="text-sm text-[var(--text-700)]">
      API access is managed by system administrators. Contact IT support to request credentials.
    </p>
  );
}

function RolesPanel() {
  const roles = [
    { name: "Chief Ombudsman", permissions: "Full access" },
    { name: "Deputy Ombudsman", permissions: "Full access" },
    { name: "Monitoring Officer", permissions: "District-scoped access" },
  ];
  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <div key={role.name} className="flex justify-between rounded-md border border-[var(--background-200)] px-3 py-2 text-sm">
          <span className="font-medium text-[var(--text-900)]">{role.name}</span>
          <span className="text-[var(--text-700)]">{role.permissions}</span>
        </div>
      ))}
    </div>
  );
}

function SystemPanel() {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="text-[var(--text-700)]">Version</dt>
        <dd className="text-[var(--text-900)]">1.0.0</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-[var(--text-700)]">Environment</dt>
        <dd className="text-[var(--text-900)]">Production</dd>
      </div>
    </dl>
  );
}

const PANELS = {
  general: GeneralPanel,
  notifications: NotificationsPanel,
  appearance: AppearancePanel,
  security: SecurityPanel,
  api: ApiPanel,
  roles: RolesPanel,
  system: SystemPanel,
};

export default function Settings() {
  const [active, setActive] = useState("general");
  const ActivePanel = PANELS[active];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-[var(--text-900)]">Settings</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto md:w-48 md:flex-col">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              onClick={() => setActive(section.key)}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-sm ${
                active === section.key
                  ? "bg-[var(--primary-500)] text-white"
                  : "text-[var(--text-700)] hover:bg-[var(--background-100)]"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-6">
          <ActivePanel />
        </div>
      </div>
    </div>
  );
}
