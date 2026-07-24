import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { SEVERITY_COLORS } from "./chartColors";

// data: [{ severity, value }]
export default function AlertChart({ data, title = "Alerts by Severity" }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="severity" outerRadius={100} label>
            {data.map((entry) => (
              <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity] || "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
