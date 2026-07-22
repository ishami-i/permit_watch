import React from "react";
import { NavLink } from "react-router-dom";
import ToolbarThemeToggle from "./ToolbarThemeToggle";

export default function Header() {
  return (
<header className="sticky top-0 z-50 bg-[var(--background-50)] border-b border-[var(--background-200)] shadow-sm">
  <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
    {/* Logo + title */}

    <div className="flex items-center gap-3">
      <img
        src="/logo.png"
        alt="Office of Ombudsman"
        className="w-10 h-10 object-contain"
      />

      <div>
        <h1 className="text-lg font-bold text-[var(--text-900)]">
          Permit Watch
        </h1>

        <p className="text-xs text-[var(--text-700)]">
          Office of Ombudsman
        </p>
      </div>
    </div>

    {/* Navigation */}

    <nav className="hidden md:flex items-center gap-8 text-sm">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/reports">Reports</NavLink>
      <NavLink to="/contact">Contact</NavLink>
    </nav>

    <ToolbarThemeToggle />
  </div>
</header>
)}
export default Header;