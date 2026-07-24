import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";

export default function AlertTable({ alerts }) {
  if (!alerts?.length) {
    return <EmptyState title="No alerts found" description="Try adjusting your filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
          <tr>
            <th className="px-4 py-2">Reason</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Severity</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Assigned Officer</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--background-200)]">
          {alerts.map((alert) => (
            <tr key={alert.id} className="hover:bg-[var(--background-100)]">
              <td className="px-4 py-2">{alert.reason}</td>
              <td className="px-4 py-2">{alert.district}</td>
              <td className="px-4 py-2">
                <StatusBadge status={alert.severity} />
              </td>
              <td className="px-4 py-2">
                <StatusBadge status={alert.status} />
              </td>
              <td className="px-4 py-2">{alert.assigned_officer?.name || "Unassigned"}</td>
              <td className="px-4 py-2 text-right">
                <Link
                  to={`/alerts/${alert.id}`}
                  className="font-medium text-[var(--primary-600)] hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
