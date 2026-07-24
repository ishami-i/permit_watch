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
      { to: "/audit", label: "Audit Logs" },
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

export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--background-200)] bg-[var(--background-50)] px-3 py-6 md:block">
      <nav className="flex flex-col gap-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-700)]">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClasses}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
