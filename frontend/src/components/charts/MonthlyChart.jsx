import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";

// data: [{ month, count }]
export default function MonthlyChart({ data, title = "Monthly Applications" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--background-200)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#cc3333" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
