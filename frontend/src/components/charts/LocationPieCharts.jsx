import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import PieLegendList from "./PieLegendList";
import { makeSliceLabel } from "./pieSliceLabel";
import { CHART_COLORS } from "./chartColors";

// data: [{ name, value }]
function LocationPieChart({ title, data, height, listMaxHeight, minLabelPercent }) {
  const items = data.map((entry, index) => ({
    ...entry,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const SliceLabel = makeSliceLabel({ minPercent: minLabelPercent });

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={height}>
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
      <PieLegendList items={items} maxHeight={listMaxHeight} />
    </ChartCard>
  );
}

export function ProvincePieChart({ data, title = "By Province" }) {
  // 5 provinces: every slice is big enough to fit its name comfortably.
  return <LocationPieChart title={title} data={data} height={320} minLabelPercent={0} />;
}

export function DistrictPieChart({ data, title = "By District" }) {
  // Districts can run to 30 entries: only the bigger slices fit a label
  // in-chart, the rest are still identifiable via the scrollable list below.
  return (
    <LocationPieChart
      title={title}
      data={data}
      height={380}
      listMaxHeight={260}
      minLabelPercent={0.045}
    />
  );
}
