"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BRAND_COLORS = [
  'var(--chart-1)', // Sky
  'var(--chart-2)', // Indigo
  'var(--chart-3)', // Emerald
  'var(--chart-4)', // Amber
  'var(--chart-5)', // Red
  'var(--chart-6)', // Pink
  'var(--chart-7)', // Violet
  'var(--chart-8)', // Cyan
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-xs font-bold text-foreground">
              {entry.name}: <span className="text-accent">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Enhanced Visitor Trend Chart - Daily/Hourly toggle
 */
export const EnhancedVisitorChart = ({ data, view = 'daily' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No data available</span>
      </div>
    );
  }

  const formatXAxis = (value) => {
    if (view === 'hourly') {
      return `${value}:00`;
    }
    const date = new Date(value);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey={view === 'daily' ? 'date' : 'hour'}
            stroke="var(--chart-axis)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatXAxis}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            name="Visitors"
            stroke="var(--chart-1)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVisitors)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyGrowthComparisonChart = ({ data, currentLabel, previousLabel }) => {
  const chartData = Array.isArray(data) ? data : [];
  if (!chartData.length) {
    return <div className="h-[360px] flex items-center justify-center text-sm text-muted-foreground">No monthly data available</div>;
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(day) => `Day ${day}`}
          />
          <YAxis allowDecimals={false} stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
          <Line
            type="monotone"
            dataKey="currentVisitors"
            name={currentLabel || 'Selected month'}
            stroke="var(--chart-3)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="previousVisitors"
            name={previousLabel || 'Previous month'}
            stroke="var(--chart-2)"
            strokeWidth={2}
            strokeDasharray="6 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Hourly Breakdown Chart
 */
export const HourlyBreakdownChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No hourly data available</span>
      </div>
    );
  }

  const chartData = Array.from({ length: 24 }, (_, i) => {
    const found = data.find(d => d.hour === i);
    return {
      hour: `${i}:00`,
      count: found?.count || 0
    };
  });

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Device Distribution Chart
 */
export const DeviceDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No device data available</span>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ device, percent }) => `${device || 'Unknown'} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="var(--chart-2)"
            dataKey="count"
            nameKey="device"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Top Pages Chart
 */
export const TopPagesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No page data available</span>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 200 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis type="number" stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            dataKey="page"
            type="category"
            stroke="var(--chart-axis)"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            width={190}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="visits" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Geography Distribution Chart (Countries)
 */
export const GeoDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <span className="text-sm text-muted-foreground">No geographic data available</span>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="country"
            stroke="var(--chart-axis)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="var(--chart-axis)" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="visitors" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
