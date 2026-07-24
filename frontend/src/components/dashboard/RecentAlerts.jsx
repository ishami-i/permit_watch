import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";

export default function RecentAlerts({ alerts }) {
  if (!alerts?.length) {
    return <EmptyState title="No recent alerts" description="Flagged permits and irregularities will appear here." />;
  }

  return (
    <ul className="divide-y divide-[var(--background-200)] rounded-lg border border-[var(--background-200)]">
      {alerts.map((alert) => (
        <li key={alert.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <Link
              to={`/alerts/${alert.id}`}
              className="block truncate font-medium text-[var(--text-900)] hover:text-[var(--primary-600)]"
            >
              {alert.reason || `Alert #${alert.id}`}
            </Link>
            <p className="truncate text-xs text-[var(--text-700)]">{alert.district}</p>
          </div>
          <StatusBadge status={alert.severity} />
        </li>
      ))}
    </ul>
  );
}
