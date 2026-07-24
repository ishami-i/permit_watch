import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";

// data: [{ status, count }]
export default function StatusChart({ data, title = "Permit Status" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-200)" />
          <XAxis dataKey="status" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#cc3333" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
