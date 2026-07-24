import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <p className="text-6xl font-bold text-[var(--primary-500)]">404</p>
      <h1 className="text-xl font-semibold text-[var(--text-900)]">Page not found</h1>
      <p className="text-sm text-[var(--text-700)]">
        The page you're looking for doesn't exist or may have been moved.
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
