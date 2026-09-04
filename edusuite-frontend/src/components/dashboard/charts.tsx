import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const axisProps = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    color: "var(--popover-foreground)",
    fontSize: "0.8rem",
  },
} as const;

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface SeriesChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: { key: string; label: string }[];
  height?: number;
}

export function TrendAreaChart({ data, xKey, series, height = 240 }: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -18, right: 6, top: 6 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette[i % palette.length]} stopOpacity={0.35} />
              <stop offset="100%" stopColor={palette[i % palette.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={palette[i % palette.length]}
            fill={`url(#grad-${s.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ data, xKey, series, height = 240 }: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -18, right: 6, top: 6 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={palette[i % palette.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GroupedBarChart({ data, xKey, series, height = 240 }: SeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -18, right: 6, top: 6 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={palette[i % palette.length]}
            radius={[6, 6, 0, 0]}
            maxBarSize={22}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({ data, height = 240 }: { data: { label: string; value: number }[]; height?: number }) {
  return (
    <GroupedBarChart
      data={data}
      xKey="label"
      series={[{ key: "value", label: "Count" }]}
      height={height}
    />
  );
}

interface DonutProps {
  data: any[];
  height?: number;
  centerLabel?: string;
  categoryKey?: string;
  valueKey?: string;
  nameKey?: string;
}

export function DonutChart({ data, height = 220, centerLabel, categoryKey, valueKey, nameKey }: DonutProps) {
  const actualNameKey = nameKey || categoryKey || "name";
  const actualValueKey = valueKey || "value";

  const normalizedData = (data || []).map((item) => {
    const rawName = item[actualNameKey] ?? item.name ?? item.category ?? "Item";
    const rawVal = item[actualValueKey] ?? item.value ?? item.percentage ?? 0;
    return {
      ...item,
      name: String(rawName),
      value: Number(rawVal) || 0,
    };
  });

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={normalizedData}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="none"
          >
            {normalizedData.map((entry, i) => (
              <Cell key={entry.name || i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="font-display text-2xl font-extrabold">{centerLabel}</span>
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ items }: { items: { name: string }[] }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {items.map((item, i) => (
        <li key={item.name || i} className="flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: palette[i % palette.length] }}
          />
          <span className="truncate">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
