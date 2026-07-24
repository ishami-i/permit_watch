import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboardService";
import SummaryCard from "../../components/dashboard/SummaryCard";
import RecentPermits from "../../components/dashboard/RecentPermits";
import RecentAlerts from "../../components/dashboard/RecentAlerts";
import { ProvincePieChart, DistrictPieChart } from "../../components/charts/LocationPieCharts";
import MonthlyChart from "../../components/charts/MonthlyChart";
import AlertChart from "../../components/charts/AlertChart";
import WorkloadChart from "../../components/charts/WorkloadChart";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSummary = () => {
    setLoading(true);
    setError(false);
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(fetchSummary, []);

  if (loading) return <Loading label="Loading dashboard..." />;
  if (error || !summary) return <ErrorState onRetry={fetchSummary} />;

  const cards = [
    { label: "Total Permits", value: summary.total_permits },
    { label: "Flagged Permits", value: summary.flagged_permits, tone: "danger" },
    { label: "Applicants", value: summary.total_applicants },
    { label: "Projects", value: summary.total_projects },
    { label: "Monitoring Officers", value: summary.total_officers },
    { label: "Covered Districts", value: summary.covered_districts, tone: "success" },
    { label: "Uncovered Districts", value: summary.uncovered_districts, tone: "danger" },
    { label: "Pending Alerts", value: summary.pending_alerts, tone: "danger" },
    { label: "Resolved Alerts", value: summary.resolved_alerts, tone: "success" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-900)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-700)]">National overview of permits and monitoring.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProvincePieChart data={summary.permits_by_province || []} />
        <DistrictPieChart data={summary.permits_by_district || []} />
        <MonthlyChart data={summary.monthly_trend || []} />
        <AlertChart data={summary.alerts_by_severity || []} />
      </div>

      <WorkloadChart data={summary.officer_workload || []} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Recent Permits</h2>
          <RecentPermits permits={summary.recent_permits || []} />
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-[var(--text-900)]">Recent Alerts</h2>
          <RecentAlerts alerts={summary.recent_alerts || []} />
        </div>
      </div>
    </div>
  );
}
