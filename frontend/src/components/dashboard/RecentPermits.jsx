import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";

export default function RecentPermits({ permits }) {
  if (!permits?.length) {
    return <EmptyState title="No recent permits" description="New permit submissions will show up here." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
          <tr>
            <th className="px-4 py-2">Permit</th>
            <th className="px-4 py-2">Applicant</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--background-200)]">
          {permits.map((permit) => (
            <tr key={permit.id}>
              <td className="px-4 py-2">
                <Link to={`/permits/${permit.id}`} className="text-[var(--primary-600)] hover:underline">
                  {permit.project?.name || `Permit #${permit.id}`}
                </Link>
              </td>
              <td className="px-4 py-2">{permit.applicant?.name}</td>
              <td className="px-4 py-2">{permit.project?.property?.zoning?.district || "—"}</td>
              <td className="px-4 py-2">
                <StatusBadge status={permit.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
