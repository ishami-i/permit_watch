import EmptyState from "../common/EmptyState";

// events: [{ id, label, date, note }]
export default function PermitTimeline({ events }) {
  if (!events?.length) {
    return <EmptyState title="No timeline events" />;
  }

  return (
    <ol className="relative border-l border-[var(--background-200)] pl-5">
      {events.map((event) => (
        <li key={event.id} className="mb-6 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--primary-500)]" />
          <p className="text-sm font-medium text-[var(--text-900)]">{event.label}</p>
          <p className="text-xs text-[var(--text-700)]">{event.date}</p>
          {event.note && <p className="mt-1 text-sm text-[var(--text-700)]">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
