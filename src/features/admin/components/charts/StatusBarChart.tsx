import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatusBarChartProps {
  data: {
    draft: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    disbursed: number;
    cancelled: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  Draft: "#9ca3af", // Gray
  Pending: "#f59e0b", // Amber
  "Under Review": "#3b82f6", // Blue
  Approved: "#10b981", // Green
  Rejected: "#ef4444", // Red
  Disbursed: "#8b5cf6", // Purple
  Cancelled: "#6b7280", // Dark Gray
};

export function StatusBarChart({ data }: StatusBarChartProps) {
  const chartData = [
    { name: "Draft", count: data.draft },
    { name: "Pending", count: data.pending },
    { name: "Under Review", count: data.under_review },
    { name: "Approved", count: data.approved },
    { name: "Rejected", count: data.rejected },
    { name: "Disbursed", count: data.disbursed },
    { name: "Cancelled", count: data.cancelled },
  ].filter((item) => item.count > 0); // Only show statuses with data

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={STATUS_COLORS[entry.name] || "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
