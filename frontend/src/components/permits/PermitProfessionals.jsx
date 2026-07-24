const ROLES = [
  { key: "architect", label: "Architect" },
  { key: "engineer", label: "Engineer" },
  { key: "surveyor", label: "Surveyor" },
  { key: "supervisor", label: "Supervisor" },
  { key: "monitoring_officer", label: "Monitoring Officer" },
];

export default function PermitProfessionals({ permit }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ROLES.map(({ key, label }) => {
        const person = permit[key];
        return (
          <div key={key} className="rounded-lg border border-[var(--background-200)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-700)]">
              {label}
            </p>
            {person ? (
              <>
                <p className="mt-1 font-medium text-[var(--text-900)]">{person.name}</p>
                {person.phone && <p className="text-sm text-[var(--text-700)]">{person.phone}</p>}
              </>
            ) : (
              <p className="mt-1 text-sm text-[var(--text-700)]">Not assigned</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
