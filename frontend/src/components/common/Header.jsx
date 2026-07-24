import { NavLink, useNavigate } from "react-router-dom";
import ToolbarThemeToggle from "./ToolbarThemeToggle";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--background-200)] bg-[var(--background-50)] shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Office of the Ombudsman Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-[var(--text-900)]">Permit Watch</h1>
            <p className="text-xs text-[var(--text-700)]">Office of the Ombudsman</p>
          </div>
        </NavLink>

        <div className="flex items-center gap-4">
          <ToolbarThemeToggle />

          {user && (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="text-right text-sm leading-tight text-[var(--text-900)] hover:text-[var(--primary-500)]"
              >
                <span className="block font-medium">{user.name}</span>
                <span className="block text-xs capitalize text-[var(--text-700)]">
                  {user.role?.replace(/_/g, " ")}
                </span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-md border border-[var(--background-200)] px-3 py-1.5 text-sm text-[var(--text-700)] hover:bg-[var(--background-100)]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
