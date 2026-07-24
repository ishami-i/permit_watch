import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";

// data: [{ officer, permits }]
export default function WorkloadChart({ data, title = "Officer Workload" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-200)" />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="officer" width={120} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="permits" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
