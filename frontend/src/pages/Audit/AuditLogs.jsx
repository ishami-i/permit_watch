import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "../../services/auditService";
import SearchBar from "../../components/common/SearchBar";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    getAuditLogs()
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter(
      (log) =>
        log.user?.toLowerCase().includes(term) ||
        log.action?.toLowerCase().includes(term) ||
        log.module?.toLowerCase().includes(term)
    );
  }, [logs, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Audit Logs</h1>
        <p className="text-sm text-[var(--text-700)]">A record of actions taken across Permit Watch.</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by user, action, or module..." />

      {loading && <Loading label="Loading logs..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && !filtered.length && <EmptyState title="No matching audit logs" />}
      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--background-200)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--background-100)] text-left text-[var(--text-700)]">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Module</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--background-200)]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--background-100)]">
                  <td className="px-4 py-2">{log.date}</td>
                  <td className="px-4 py-2">{log.user}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">{log.module}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={log.result} tone={log.result === "success" ? "success" : "danger"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
