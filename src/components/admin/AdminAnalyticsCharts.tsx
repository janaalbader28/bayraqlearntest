"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, GraduationCap, DollarSign, PieChart as PieIcon } from "lucide-react";

type AnalyticsData = {
  labels: string[];
  usersGrowth: { month: string; users: number }[];
  enrollmentsGrowth: { month: string; enrollments: number }[];
  revenueGrowth: { month: string; revenue: number }[];
  popularCourses: { title: string; enrollments: number }[];
  categoryDistribution: { category: string; count: number }[];
};

const PIE_COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#1d4ed8", "#1e40af", "#6366f1", "#818cf8",
];

const CARD_STYLE: React.CSSProperties = {
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
  fontSize: "12px",
};

type RechartsTooltipPayload = {
  active?: boolean;
  payload?: { color?: string; name?: string; value?: number }[];
  label?: string;
  valueSuffix?: string;
};

function SimpleTooltip(props: RechartsTooltipPayload) {
  const { active, payload, label, valueSuffix = "" } = props;
  if (!active || !payload?.length) return null;
  return (
    <div style={CARD_STYLE} className="px-3 py-2 bg-white">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: { color?: string; name?: string; value?: number }, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{Number(p.value ?? 0).toLocaleString()}{valueSuffix}</span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/10">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-48 animate-pulse rounded-xl bg-slate-100" />;
}

type PieLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
};

const RADIAN = Math.PI / 180;
function PieLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = "" }: PieLabelProps) {
  if (percent < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export function AdminAnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d: AnalyticsData) => setData(d))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Analytics</h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Users Growth */}
        <ChartCard title="User Registrations (12 months)" icon={Users}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.usersGrowth ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={<SimpleTooltip />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="Users"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#2563eb" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Enrollments */}
        <ChartCard title="Enrollments (12 months)" icon={GraduationCap}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.enrollmentsGrowth ?? []} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                <Tooltip content={<SimpleTooltip />} />
                <Bar dataKey="enrollments" name="Enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Revenue */}
        <ChartCard title="Revenue — SAR (12 months)" icon={DollarSign}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.revenueGrowth ?? []}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<SimpleTooltip valueSuffix=" SAR" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard title="Course Category Distribution" icon={PieIcon}>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data?.categoryDistribution ?? []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={32}
                  paddingAngle={2}
                  labelLine={false}
                  label={PieLabel}
                >
                  {(data?.categoryDistribution ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0];
                    return (
                      <div style={CARD_STYLE} className="px-3 py-2 bg-white">
                        <p className="font-semibold text-slate-700">{String(item.name)}</p>
                        <p className="text-xs text-slate-500">{Number(item.value ?? 0)} courses</p>
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
