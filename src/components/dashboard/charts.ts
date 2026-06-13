// Shared chart colors (kept as direct values because Recharts needs CSS color strings).
export const CHART_COLORS = [
  "#8b5cf6", // violet
  "#22d3ee", // cyan
  "#34d399", // emerald
  "#f59e0b", // amber
  "#f472b6", // pink
  "#60a5fa", // blue
  "#fb7185", // rose
  "#a3e635", // lime
];

export const tooltipStyle = {
  background: "oklch(0.21 0.025 260)",
  border: "1px solid oklch(1 0 0 / 0.1)",
  borderRadius: 8,
  fontSize: 12,
  color: "white",
  padding: "8px 10px",
};

export const axisTickStyle = { fill: "oklch(0.7 0.02 260)", fontSize: 11 };
