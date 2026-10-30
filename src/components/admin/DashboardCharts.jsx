"use client";

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const MODERN_PALETTE = [
  '#0ea5e9', // Sky / Accent Cyan
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

const formatChartDate = (str) => {
  if (!str) return '';
  const parts = str.split('-').map(Number);
  if (parts.length < 3) return str;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const formattedLabel = typeof label === 'string' && label.includes('-') && label.length === 10
    ? formatChartDate(label)
    : label;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-border/50">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        {formattedLabel}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {entry.name}:
            </span>
            <span className="text-xs font-bold text-foreground tabular-nums">
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart = ({ message = "No activity recorded yet" }) => (
  <div className="h-full min-h-[220px] w-full flex items-center justify-center text-xs font-medium text-muted-foreground/60 border border-dashed border-border/60 rounded-xl bg-muted/10">
    {message}
  </div>
);

export const BookingTrendChart = ({ data }) => {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (!chartData.length) return <EmptyChart message="No bookings recorded yet" />;

  const total = chartData.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="70%" stopColor="#6366f1" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="_id"
              stroke="var(--chart-axis)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatChartDate}
              dy={6}
            />
            <YAxis
              stroke="var(--chart-axis)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Bookings"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorBookings)"
              activeDot={{ r: 5, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px] text-muted-foreground">
        <span>Total Period Volume: <strong className="text-foreground font-semibold">{total} bookings</strong></span>
        <span className="flex items-center gap-1.5 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> Confirmed pipeline</span>
      </div>
    </div>
  );
};

export const ServiceDistributionChart = ({ data }) => {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const visibleData = useMemo(() => {
    const list = chartData.slice(0, 5).map((item) => ({ ...item, _id: String(item._id || "Other") }));
    const extraCount = chartData.slice(5).reduce((sum, item) => sum + (item.count || 0), 0);
    if (extraCount) list.push({ _id: "Other services", count: extraCount });
    return list;
  }, [chartData]);

  const total = useMemo(() => visibleData.reduce((sum, d) => sum + (d.count || 0), 0), [visibleData]);

  if (!chartData.some((item) => item.count > 0)) {
    return <EmptyChart message="No booking services recorded yet" />;
  }

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              cornerRadius={4}
              dataKey="count"
              nameKey="_id"
              isAnimationActive={true}
              animationDuration={800}
            >
              {visibleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MODERN_PALETTE[index % MODERN_PALETTE.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
            {total}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Inquiries
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        {visibleData.map((item, index) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = MODERN_PALETTE[index % MODERN_PALETTE.length];
          return (
            <div key={item._id} className="group/item flex items-center gap-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground group-hover/item:text-accent transition-colors" title={item._id}>
                    {item._id}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-foreground">
                    {item.count} <span className="text-[10px] font-normal text-muted-foreground">({percent}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ContentActivityChart = ({ data }) => {
  const safeData = useMemo(() => ({
    blogs: Array.isArray(data?.blogs) ? data.blogs : [],
    services: Array.isArray(data?.services) ? data.services : [],
    projects: Array.isArray(data?.projects) ? data.projects : [],
  }), [data]);

  const months = useMemo(() => [...new Set([
    ...safeData.blogs.map(d => d._id),
    ...safeData.services.map(d => d._id),
    ...safeData.projects.map(d => d._id)
  ])].sort(), [safeData]);

  const chartData = useMemo(() => months.map(month => ({
    name: month,
    Blogs: safeData.blogs.find(d => d._id === month)?.count || 0,
    Services: safeData.services.find(d => d._id === month)?.count || 0,
    Projects: safeData.projects.find(d => d._id === month)?.count || 0,
  })), [months, safeData]);

  if (!months.length) return <EmptyChart message="No publishing activity recorded yet" />;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.6} />
          <XAxis
            dataKey="name"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              if (!str) return '';
              const [year, month] = str.split('-');
              const d = new Date(year, (month || 1) - 1);
              return d.toLocaleDateString(undefined, { month: 'short' });
            }}
            dy={6}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Blogs" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="Projects" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
          <Bar dataKey="Services" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VisitorGrowthChart = ({ data }) => {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const stats = useMemo(() => {
    const total = chartData.reduce((sum, d) => sum + (Number(d.count) || 0), 0);
    const avg = chartData.length ? Math.round(total / chartData.length) : 0;
    const peak = chartData.reduce((max, d) => (Number(d.count) > Number(max.count || 0) ? d : max), { count: 0, _id: '' });
    return { total, avg, peak };
  }, [chartData]);

  if (!chartData.length) return <EmptyChart message="No visitor telemetry recorded yet" />;

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="min-h-[220px] flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisitorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#0ea5e9" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="_id"
              stroke="var(--chart-axis)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatChartDate}
              dy={6}
            />
            <YAxis
              stroke="var(--chart-axis)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              name="Visitors"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorVisitorGrowth)"
              activeDot={{ r: 5, fill: '#0ea5e9', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-2.5">
        <div className="rounded-lg bg-muted/20 px-2.5 py-1.5 border border-border/40">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">30d Total</p>
          <p className="mt-0.5 text-xs font-black text-foreground tabular-nums">{stats.total.toLocaleString()}</p>
        </div>
        <div className="rounded-lg bg-muted/20 px-2.5 py-1.5 border border-border/40">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Daily Avg</p>
          <p className="mt-0.5 text-xs font-black text-foreground tabular-nums">~{stats.avg.toLocaleString()}/day</p>
        </div>
        <div className="rounded-lg bg-muted/20 px-2.5 py-1.5 border border-border/40">
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Peak Day</p>
          <p className="mt-0.5 text-xs font-black text-accent tabular-nums truncate">
            {stats.peak.count} <span className="text-[9px] font-normal text-muted-foreground">({formatChartDate(stats.peak._id)})</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const PageViewsChart = ({ data }) => {
  const chartData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const visibleData = useMemo(() => {
    const simplifyPath = (value = "") => {
      if (value === "/") return "Home";
      const clean = value.split("?")[0].split("#")[0];
      const firstPart = clean.split("/").filter(Boolean)[0];
      if (!firstPart) return "Other";
      return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).replaceAll("-", " ");
    };

    const grouped = chartData.reduce((items, item) => {
      const name = simplifyPath(item._id);
      items[name] = (items[name] || 0) + (item.count || 0);
      return items;
    }, {});

    return Object.entries(grouped)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [chartData]);

  const total = useMemo(() => visibleData.reduce((sum, d) => sum + d.count, 0), [visibleData]);

  if (!chartData.some((item) => item.count > 0)) {
    return <EmptyChart message="No page views recorded yet" />;
  }

  return (
    <div className="flex h-full flex-1 w-full flex-col justify-between">
      <div className="relative min-h-[170px] flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visibleData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              cornerRadius={4}
              dataKey="count"
              nameKey="_id"
              isAnimationActive={true}
              animationDuration={800}
            >
              {visibleData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={MODERN_PALETTE[index % MODERN_PALETTE.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tracking-tight text-foreground tabular-nums">
            {total > 999 ? `${(total / 1000).toFixed(1)}k` : total}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Views
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        {visibleData.map((item, index) => {
          const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = MODERN_PALETTE[index % MODERN_PALETTE.length];
          return (
            <div key={item._id} className="group/item flex items-center gap-2 text-xs">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground group-hover/item:text-accent transition-colors" title={item._id}>
                    {item._id}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-foreground">
                    {item.count.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">({percent}%)</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};