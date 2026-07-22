import React from "react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (

<footer className="border-t border-[var(--background-200)] bg-[var(--background-100)]">
  <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
    <div>
      <h3 className="font-semibold text-[var(--text-900)]">
        Office of Ombudsman
      </h3>

      <p className="text-sm text-[var(--text-700)]">
        Transparency and accountability.
      </p>
    </div>

    <div className="flex gap-6 text-sm">
      <NavLink to="/privacy-policy">Privacy Policy</NavLink>

      <NavLink to="/terms-of-service">
        Terms of Service
      </NavLink>
    </div>
  </div>
</footer>
  );
}
export default Footer;