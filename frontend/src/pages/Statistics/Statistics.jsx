import { useEffect, useMemo, useState } from "react";
import { getFullPermits, getFlaggedPermits } from "../../services/permitService";
import ChartCard from "../../components/charts/ChartCard";
import { CHART_COLORS } from "../../components/charts/chartColors";
import SummaryCard from "../../components/dashboard/SummaryCard";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function groupBy(data, getKey) {
  const counts = {};
  data.forEach((item) => {
    const key = getKey(item) || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function PieCard({ title, data }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export default function Statistics() {
  const [permits, setPermits] = useState([]);
  const [flaggedPermits, setFlaggedPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getFullPermits(), getFlaggedPermits()])
      .then(([permitData, flaggedData]) => {
        setPermits(permitData);
        setFlaggedPermits(flaggedData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const permitProvinceData = useMemo(
    () => groupBy(permits, (p) => p?.property?.property_province),
    [permits]
  );
  const permitDistrictData = useMemo(
    () => groupBy(permits, (p) => p?.property?.property_district),
    [permits]
  );
  const flaggedProvinceData = useMemo(
    () => groupBy(flaggedPermits, (p) => p?.property?.property_province),
    [flaggedPermits]
  );
  const flaggedDistrictData = useMemo(
    () => groupBy(flaggedPermits, (p) => p?.property?.property_district),
    [flaggedPermits]
  );

  if (loading) return <Loading label="Loading statistics..." />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Statistics</h1>
        <p className="text-sm text-[var(--text-700)]">Aggregate view of permits across the country.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard label="Total Permits" value={permits.length} />
        <SummaryCard label="Flagged Permits" value={flaggedPermits.length} tone="danger" />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-900)]">Permit Statistics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PieCard title="Permits by Province" data={permitProvinceData} />
          <PieCard title="Permits by District" data={permitDistrictData} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--text-900)]">Flagged Permit Statistics</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PieCard title="Flagged Permits by Province" data={flaggedProvinceData} />
          <PieCard title="Flagged Permits by District" data={flaggedDistrictData} />
        </div>
      </div>
    </div>
  );
}
