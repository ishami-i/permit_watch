import { useEffect, useMemo, useState } from "react";
import { getAssignedOfficers } from "../../services/monitoringService";
import SearchBar from "../../components/common/SearchBar";
import OfficerTable from "../../components/monitoring/OfficerTable";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

export default function AssignedOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    setError(false);
    getAssignedOfficers()
      .then((data) => setOfficers(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return officers;
    return officers.filter(
      (o) => o.name?.toLowerCase().includes(term) || o.district?.toLowerCase().includes(term)
    );
  }, [officers, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Assigned Officers</h1>
        <p className="text-sm text-[var(--text-700)]">Monitoring officers currently assigned to a district.</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or district..." />

      {loading && <Loading label="Loading officers..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && <OfficerTable officers={filtered} />}
    </div>
  );
}
