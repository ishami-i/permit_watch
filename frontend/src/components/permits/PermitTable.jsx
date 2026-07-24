import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";

export default function PermitTable({ permits }) {
  if (!permits?.length) {
    return <EmptyState title="No permits found" description="Try adjusting your search or filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
          <tr>
            <th className="px-4 py-2">Permit ID</th>
            <th className="px-4 py-2">Applicant</th>
            <th className="px-4 py-2">Project</th>
            <th className="px-4 py-2">UPI</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Submitted</th>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Supervisor</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--background-200)]">
          {permits.map((permit) => {
            const zoning = permit.project?.property?.zoning ?? {};
            return (
              <tr key={permit.id} className="hover:bg-[var(--background-100)]">
                <td className="px-4 py-2">{permit.id}</td>
                <td className="px-4 py-2">{permit.applicant?.name}</td>
                <td className="px-4 py-2">{permit.project?.name}</td>
                <td className="px-4 py-2">{permit.project?.upi}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={permit.status} />
                </td>
                <td className="px-4 py-2">{permit.submission_date}</td>
                <td className="px-4 py-2">{zoning.district}</td>
                <td className="px-4 py-2">{permit.supervisor?.name}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    to={`/permits/${permit.id}`}
                    className="font-medium text-[var(--primary-600)] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
