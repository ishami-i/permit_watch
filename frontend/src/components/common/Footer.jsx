import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--background-200)] bg-[var(--background-100)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
        <div>
          <h3 className="font-semibold text-[var(--text-900)]">Office of Ombudsman</h3>
          <p className="text-sm text-[var(--text-700)]">Transparency and accountability.</p>
        </div>

        <div className="flex gap-6 text-sm text-[var(--text-700)]">
          <NavLink to="/privacy-policy" className="hover:text-[var(--primary-500)]">
            Privacy Policy
          </NavLink>
          <NavLink to="/terms-of-service" className="hover:text-[var(--primary-500)]">
            Terms of Service
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
