import { Outlet } from "react-router-dom";

export default function ErrorLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background-50)] px-4 text-center text-[var(--text-900)]">
      <img src="/logo.png" alt="Office of the Ombudsman Logo" className="h-12 w-12 object-contain" />
      <Outlet />
    </div>
  );
}
