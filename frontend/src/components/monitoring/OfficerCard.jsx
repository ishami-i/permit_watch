export default function OfficerCard({ officer, onAssign }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--background-200)] p-4">
      <div>
        <p className="font-medium text-[var(--text-900)]">{officer.name}</p>
        <p className="text-sm text-[var(--text-700)]">{officer.email}</p>
        <p className="text-sm text-[var(--text-700)]">{officer.phone}</p>
      </div>
      <button
        onClick={() => onAssign(officer)}
        className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
      >
        Assign
      </button>
    </div>
  );
}
