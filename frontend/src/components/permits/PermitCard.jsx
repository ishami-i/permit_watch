import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function PermitCard({ permit }) {
  return (
    <Link
      to={`/permits/${permit.id}`}
      className="block rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--text-900)]">
            {permit.project?.name || `Permit #${permit.id}`}
          </p>
          <p className="truncate text-xs text-[var(--text-700)]">{permit.project?.upi}</p>
        </div>
        <StatusBadge status={permit.status} />
      </div>
      <p className="mt-2 text-xs text-[var(--text-700)]">Submitted {permit.submission_date}</p>
    </Link>
  );
}
