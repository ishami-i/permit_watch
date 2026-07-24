import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="space-y-3">
      <p className="text-6xl font-bold text-[var(--primary-500)]">403</p>
      <h1 className="text-xl font-semibold text-[var(--text-900)]">Access denied</h1>
      <p className="text-sm text-[var(--text-700)]">
        Your role doesn't have permission to view this page.
      </p>
      <Link
        to="/dashboard"
        className="inline-block rounded-md bg-[var(--primary-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
