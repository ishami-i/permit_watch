import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/permits", label: "My Permits" },
  { to: "/permits/flagged", label: "Flagged" },
  { to: "/alerts", label: "Alerts" },
  { to: "/profile", label: "Profile" },
];

const linkClasses = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm transition-colors ${
    isActive
      ? "bg-[var(--primary-500)] text-white"
      : "text-[var(--text-700)] hover:bg-[var(--background-100)] hover:text-[var(--text-900)]"
  }`;

export default function CompactSidebar({ district }) {
  return (
    <aside className="hidden w-52 shrink-0 border-r border-[var(--background-200)] bg-[var(--background-50)] px-3 py-6 md:block">
      {district && (
        <div className="mb-4 rounded-md bg-[var(--primary-100)] px-3 py-2 text-center text-xs font-semibold text-[var(--primary-700)]">
          {district} District
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClasses}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
