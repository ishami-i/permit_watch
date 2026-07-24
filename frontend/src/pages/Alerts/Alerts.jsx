import { useEffect, useMemo, useState } from "react";
import { getAlerts } from "../../services/alertService";
import FilterBar from "../../components/common/FilterBar";
import AlertTable from "../../components/alerts/AlertTable";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({ severity: "", district: "", status: "" });

  const load = () => {
    setLoading(true);
    setError(false);
    getAlerts()
      .then((data) => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const districtOptions = useMemo(() => {
    const districts = [...new Set(alerts.map((a) => a.district).filter(Boolean))];
    return districts.map((d) => ({ value: d, label: d }));
  }, [alerts]);

  const filtered = useMemo(() => {
    return alerts.filter(
      (alert) =>
        (!filters.severity || alert.severity === filters.severity) &&
        (!filters.district || alert.district === filters.district) &&
        (!filters.status || alert.status === filters.status)
    );
  }, [alerts, filters]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Alerts</h1>
        <p className="text-sm text-[var(--text-700)]">Irregularities flagged for review.</p>
      </div>

      <FilterBar
        filters={[
          { key: "severity", label: "All Severities", options: SEVERITY_OPTIONS },
          { key: "district", label: "All Districts", options: districtOptions },
          { key: "status", label: "All Statuses", options: STATUS_OPTIONS },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
      />

      {loading && <Loading label="Loading alerts..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && <AlertTable alerts={filtered} />}
    </div>
  );
}
