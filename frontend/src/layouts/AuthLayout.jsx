import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--background-100)] px-4">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--primary-100)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[var(--primary-200)] opacity-60 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Office of the Ombudsman Logo" className="h-14 w-14 object-contain" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--text-900)]">Permit Watch</h1>
            <p className="text-sm text-[var(--text-700)]">Office of the Ombudsman</p>
          </div>
        </div>

        <div className="rounded-xl bg-[var(--background-50)] p-8 shadow-md">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-700)]">
          © {new Date().getFullYear()} Office of the Ombudsman. All rights reserved.
        </p>
      </div>
    </div>
  );
}
