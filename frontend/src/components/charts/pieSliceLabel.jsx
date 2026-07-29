const RADIAN = Math.PI / 180;

// Renders the slice's name (and value) directly inside the wedge, positioned
// at its mid-angle. Slices below the given percent threshold are skipped
// since text won't fit — those are still visible via color + tooltip + the
// list legend underneath.
export function makeSliceLabel({ minPercent = 0.045 } = {}) {
  return function SliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) {
    if (percent < minPercent) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.62;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize={11}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        <tspan x={x} dy="-0.35em">
          {name}
        </tspan>
        <tspan x={x} dy="1.1em">
          {value}
        </tspan>
      </text>
    );
  };
}
