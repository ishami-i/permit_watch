import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { CHART_COLORS } from "./chartColors";

// data: [{ name, value }]
function LocationPieChart({ title, data }) {
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

export function ProvincePieChart({ data, title = "By Province" }) {
  return <LocationPieChart title={title} data={data} />;
}

export function DistrictPieChart({ data, title = "By District" }) {
  return <LocationPieChart title={title} data={data} />;
}
