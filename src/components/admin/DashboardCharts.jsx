"use client";

import React from 'react';
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

const BRAND_COLORS = [
  'var(--chart-1)', // Sky
  'var(--chart-2)', // Indigo
  'var(--chart-3)', // Emerald
  'var(--chart-4)', // Amber
  'var(--chart-5)', // Red
  'var(--chart-6)', // Pink
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-sm font-bold text-foreground">
              {entry.name}: <span className="text-accent">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyChart = ({ message = "No activity recorded yet" }) => (
  <div className="h-[300px] w-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
    {message}
  </div>
);

export const BookingTrendChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="_id"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              const [year, month, day] = str.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            name="Bookings"
            stroke="var(--chart-1)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCount)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ServiceDistributionChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];
  if (!chartData.some((item) => item.count > 0)) return <EmptyChart message="No booking services recorded yet" />;

  const visibleData = chartData.slice(0, 5).map((item) => ({ ...item, _id: String(item._id || "Other") }));
  const extraCount = chartData.slice(5).reduce((sum, item) => sum + (item.count || 0), 0);
  if (extraCount) visibleData.push({ _id: "Other services", count: extraCount });

  return (
    <div className="flex h-[300px] w-full flex-col">
      <div className="min-h-0 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={visibleData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="_id"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {visibleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3">
        {visibleData.map((item, index) => <div key={item._id} className="flex min-w-0 items-center gap-2 text-[9px] font-semibold text-muted-foreground"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_COLORS[index % BRAND_COLORS.length] }} /><span className="truncate" title={item._id}>{item._id}</span><span className="ml-auto text-foreground">{item.count}</span></div>)}
      </div>
    </div>
  );
};

export const ContentActivityChart = ({ data }) => {
  const safeData = {
    blogs: Array.isArray(data?.blogs) ? data.blogs : [],
    services: Array.isArray(data?.services) ? data.services : [],
    projects: Array.isArray(data?.projects) ? data.projects : [],
  };
  // Merge multiple data sources into one for the bar chart
  const months = [...new Set([
    ...safeData.blogs.map(d => d._id),
    ...safeData.services.map(d => d._id),
    ...safeData.projects.map(d => d._id)
  ])].sort();

  const chartData = months.map(month => ({
    name: month,
    Blogs: safeData.blogs.find(d => d._id === month)?.count || 0,
    Services: safeData.services.find(d => d._id === month)?.count || 0,
    Projects: safeData.projects.find(d => d._id === month)?.count || 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
                const [year, month] = str.split('-');
                const d = new Date(year, month - 1);
                return d.toLocaleDateString(undefined, { month: 'short' });
            }}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Blogs" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Services" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Projects" fill="var(--chart-3)" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VisitorGrowthChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorVisitorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="_id"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(str) => {
              if(!str) return '';
              const [year, month, day] = str.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            name="Visitors"
            stroke="var(--chart-3)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVisitorGrowth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PageViewsChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];
  if (!chartData.some((item) => item.count > 0)) return <EmptyChart message="No page views recorded yet" />;

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
  const visibleData = Object.entries(grouped).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="flex h-[300px] w-full flex-col">
      <div className="min-h-0 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={visibleData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="_id"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {visibleData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3">
        {visibleData.map((item, index) => <div key={item._id} className="flex min-w-0 items-center gap-2 text-[9px] font-semibold text-muted-foreground"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: BRAND_COLORS[index % BRAND_COLORS.length] }} /><span className="truncate">{item._id}</span><span className="ml-auto text-foreground">{item.count}</span></div>)}
      </div>
    </div>
  );
};
