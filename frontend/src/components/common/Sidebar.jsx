import { NavLink } from "react-router-dom";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Permits",
    items: [
      { to: "/permits", label: "All Permits" },
      { to: "/permits/flagged", label: "Flagged" },
      { to: "/permits/pending", label: "Pending" },
    ],
  },
  {
    label: "Records",
    items: [
      { to: "/projects", label: "Projects" },
      { to: "/applicants", label: "Applicants" },
      { to: "/alerts", label: "Alerts" },
      { to: "/statistics", label: "Statistics" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { to: "/monitoring/assigned", label: "Assigned Officers" },
      { to: "/monitoring/unassigned", label: "Unassigned Officers" },
      { to: "/monitoring/coverage", label: "District Coverage" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/users", label: "Users" },
      { to: "/settings", label: "Settings" },
    ],
  },
];

const linkClasses = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-[var(--primary-500)] text-white"
      : "text-[var(--text-700)] hover:bg-[var(--background-100)] hover:text-[var(--text-900)]"
  }`;

function NavContent({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-700)]">
            {section.label}
          </p>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onNavigate}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function Sidebar({ open = false, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[var(--background-200)] bg-[var(--background-50)] px-3 py-6 md:block">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col overflow-y-auto bg-[var(--background-50)] px-3 py-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between px-3">
              <span className="text-sm font-semibold text-[var(--text-900)]">Menu</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="rounded-md p-1.5 text-[var(--text-700)] hover:bg-[var(--background-100)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <NavContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
