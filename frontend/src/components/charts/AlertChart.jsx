import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import PieLegendList from "./PieLegendList";
import { makeSliceLabel } from "./pieSliceLabel";
import { SEVERITY_COLORS } from "./chartColors";

const SliceLabel = makeSliceLabel({ minPercent: 0 });

// data: [{ severity, value }]
export default function AlertChart({ data, title = "Alerts by Severity" }) {
  const items = data.map((entry) => ({
    name: entry.severity,
    value: entry.value,
    color: SEVERITY_COLORS[entry.severity] || "#94a3b8",
  }));

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={items}
            dataKey="value"
            nameKey="name"
            outerRadius="92%"
            labelLine={false}
            label={SliceLabel}
          >
            {items.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <PieLegendList items={items} />
    </ChartCard>
  );
}
