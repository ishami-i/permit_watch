import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";

export default function DistrictTable({ districts }) {
  if (!districts?.length) {
    return <EmptyState title="No district data" />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
          <tr>
            <th className="px-4 py-2">District</th>
            <th className="px-4 py-2">Assigned Officer</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--background-200)]">
          {districts.map((row) => (
            <tr key={row.district} className="hover:bg-[var(--background-100)]">
              <td className="px-4 py-2 font-medium text-[var(--text-900)]">{row.district}</td>
              <td className="px-4 py-2">{row.officer?.name || "None"}</td>
              <td className="px-4 py-2">
                <StatusBadge status={row.officer ? "covered" : "needs_assignment"} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
