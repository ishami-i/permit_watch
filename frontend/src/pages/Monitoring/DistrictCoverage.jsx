import { useEffect, useState } from "react";
import { getDistrictCoverage } from "../../services/monitoringService";
import DistrictTable from "../../components/monitoring/DistrictTable";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

export default function DistrictCoverage() {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getDistrictCoverage()
      .then((data) => setDistricts(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const uncovered = districts.filter((d) => !d.officer).length;

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">District Coverage</h1>
        <p className="text-sm text-[var(--text-700)]">
          {loading ? "Loading..." : `${uncovered} district${uncovered === 1 ? "" : "s"} need${uncovered === 1 ? "s" : ""} an officer.`}
        </p>
      </div>

      {loading && <Loading label="Loading coverage..." />}
      {!loading && error && <ErrorState onRetry={load} />}
      {!loading && !error && <DistrictTable districts={districts} />}
    </div>
  );
}
