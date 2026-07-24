import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOfficer } from "../../services/monitoringService";
import Breadcrumb from "../../components/common/Breadcrumb";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import SummaryCard from "../../components/dashboard/SummaryCard";
import PermitTable from "../../components/permits/PermitTable";

export default function OfficerProfile() {
  const { id } = useParams();
  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getOfficer(id)
      .then(setOfficer)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  if (loading) return <Loading label="Loading officer..." />;
  if (error || !officer) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <Breadcrumb items={[{ label: "Assigned Officers", to: "/monitoring/assigned" }, { label: officer.name }]} />

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">{officer.name}</h1>
        <p className="text-sm text-[var(--text-700)]">
          {officer.district} · {officer.phone} · {officer.email}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <SummaryCard label="Permits" value={officer.permit_count ?? 0} />
        <SummaryCard label="Alerts" value={officer.alert_count ?? 0} tone="danger" />
        <SummaryCard label="Performance" value={officer.performance_score ?? "—"} tone="success" />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Permits under supervision</h2>
        <PermitTable permits={officer.permits || []} />
      </section>
    </div>
  );
}
