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

function NavContent({ district, onNavigate }) {
  return (
    <>
      {district && (
        <div className="mb-4 rounded-md bg-[var(--primary-100)] px-3 py-2 text-center text-xs font-semibold text-[var(--primary-700)]">
          {district} District
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClasses} onClick={onNavigate}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function CompactSidebar({ district, open = false, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-52 shrink-0 border-r border-[var(--background-200)] bg-[var(--background-50)] px-3 py-6 md:block">
        <NavContent district={district} />
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
            <NavContent district={district} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
