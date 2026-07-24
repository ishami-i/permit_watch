import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function AlertCard({ alert }) {
  return (
    <Link
      to={`/alerts/${alert.id}`}
      className="block rounded-lg border border-[var(--background-200)] bg-[var(--background-50)] p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-[var(--text-900)]">{alert.reason}</p>
        <StatusBadge status={alert.severity} />
      </div>
      <p className="mt-1 text-xs text-[var(--text-700)]">{alert.district}</p>
    </Link>
  );
}
