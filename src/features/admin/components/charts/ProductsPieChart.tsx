import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ProductData {
  name: string;
  applications: number;
  approved: number;
  approval_rate: string;
}

interface ProductsPieChartProps {
  data: ProductData[];
}

const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
  "#82CA9D", // Green
  "#FFC658", // Light orange
  "#8DD1E1", // Light blue
];

export function ProductsPieChart({ data }: ProductsPieChartProps) {
  const chartData = data.map((product) => ({
    name: product.name,
    value: product.applications,
    approved: product.approved,
    approval_rate: product.approval_rate,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No product data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, value }) => `${name} (${value})`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number, name: string) => [
            `${value} applications`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
