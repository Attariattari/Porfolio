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
  Legend,
  AreaChart,
  Area
} from 'recharts';

const BRAND_COLORS = [
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
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

export const BookingTrendChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="_id" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="count" 
            name="Bookings"
            stroke="#0ea5e9" 
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
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={80} 
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "10px" }}
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mr-2 inline-block mb-2">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ContentActivityChart = ({ data }) => {
  // Merge multiple data sources into one for the bar chart
  const months = [...new Set([
    ...data.blogs.map(d => d._id),
    ...data.services.map(d => d._id),
    ...data.projects.map(d => d._id)
  ])].sort();

  const chartData = months.map(month => ({
    name: month,
    Blogs: data.blogs.find(d => d._id === month)?.count || 0,
    Services: data.services.find(d => d._id === month)?.count || 0,
    Projects: data.projects.find(d => d._id === month)?.count || 0,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => {
                const [year, month] = str.split('-');
                const d = new Date(year, month - 1);
                return d.toLocaleDateString(undefined, { month: 'short' });
            }}
          />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Blogs" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Services" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Projects" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const VisitorGrowthChart = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVisitorGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="_id" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => {
              if(!str) return '';
              const date = new Date(str);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="count" 
            name="Visitors"
            stroke="#10b981" 
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
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
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
            {data?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={80} 
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "10px" }}
            iconType="circle"
            formatter={(value) => {
               // simplify path names
               let name = value || "Other";
               if (name === "/") name = "Home";
               else if (name.startsWith("/services")) name = "Services";
               else if (name.startsWith("/projects")) name = "Projects";
               else if (name.startsWith("/blogs")) name = "Blogs";
               else if (name.startsWith("/contact")) name = "Contact";
               else if (name.startsWith("/about")) name = "About";
               return <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mr-2 inline-block mb-2">{name}</span>
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
