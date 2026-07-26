import { Link } from "react-router-dom";
import EmptyState from "../common/EmptyState";

export default function OfficerTable({ officers, onEdit, onUnassign }) {
  if (!officers?.length) {
    return <EmptyState title="No officers found" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Permits</th>
            <th className="px-4 py-2">Alerts</th>
            <th className="px-4 py-2">Performance</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--background-200)]">
          {officers.map((officer) => (
            <tr key={officer.id} className="hover:bg-[var(--background-100)]">
              <td className="px-4 py-2 font-medium text-[var(--text-900)]">{officer.name}</td>
              <td className="px-4 py-2">{officer.district}</td>
              <td className="px-4 py-2">{officer.phone}</td>
              <td className="px-4 py-2">{officer.email}</td>
              <td className="px-4 py-2">{officer.permit_count ?? 0}</td>
              <td className="px-4 py-2">{officer.alert_count ?? 0}</td>
              <td className="px-4 py-2">{officer.performance_score ?? "—"}</td>
              <td className="px-4 py-2 text-right">
                <div className="flex justify-end gap-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(officer)}
                      className="font-medium text-[var(--primary-600)] hover:underline"
                    >
                      Edit
                    </button>
                  )}
                  {onUnassign && (
                    <button
                      onClick={() => onUnassign(officer)}
                      className="font-medium text-[var(--danger-500)] hover:underline"
                    >
                      Unassign
                    </button>
                  )}
                  <Link
                    to={`/monitoring/officers/${officer.id}`}
                    className="font-medium text-[var(--primary-600)] hover:underline"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}