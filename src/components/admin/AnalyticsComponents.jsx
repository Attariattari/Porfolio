"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Monitor, MapPin, FileText, Users, TrendingDown, TrendingUp, ExternalLink } from 'lucide-react';

/**
 * Analytics Data Table
 */
export const AnalyticsTable = ({ title, data, columns, icon: Icon, isLoading }) => {
  return (
    <div className="border border-border/70 bg-card/40 rounded-[2rem] overflow-hidden">
      <div className="p-8 border-b border-border/70">
        <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <Icon className="w-6 h-6 text-accent" />
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border/70">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  {typeof col === 'string' ? col : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs text-muted-foreground">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {columns.map((col, j) => {
                    const key = typeof col === 'string' ? col : col.key;
                    // Try different case variations to find the value
                    const value = row[key] ?? row[key.toLowerCase()] ?? row[key.charAt(0).toLowerCase() + key.slice(1)];

                    let displayValue = value ?? '—';

                    if (typeof value === 'number') {
                      if (key.toLowerCase().includes('duration')) {
                        const mins = Math.floor(value / 60);
                        const secs = value % 60;
                        displayValue = mins > 0 ? `${mins}m ${secs}s` : `${value}s`;
                      } else if (key.toLowerCase().includes('rate')) {
                        displayValue = `${value.toFixed(1)}%`;
                      } else {
                        displayValue = value.toLocaleString();
                      }
                    }

                    return (
                      <td key={j} className="px-6 py-4 text-sm text-foreground">
                        {key.toLowerCase().includes('rate') ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              value < 30 ? 'bg-emerald-500 shadow-sm' :
                              value > 70 ? 'bg-red-500 shadow-sm' :
                              'bg-amber-500 shadow-sm'
                            }`} />
                            <span className="font-bold italic">{displayValue}</span>
                          </div>
                        ) : key.toLowerCase().includes('duration') ? (
                          <span className="text-accent font-black italic">{displayValue}</span>
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <span className="text-xs text-muted-foreground opacity-50">No data available</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Device Stats Grid
 */
export const DeviceStatsGrid = ({ devices, isLoading }) => {
  const icons = {
    mobile: Monitor,
    desktop: Monitor,
    tablet: Monitor,
    unknown: Monitor,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading ? (
        Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 border border-border/70 rounded-xl animate-pulse" />
        ))
      ) : (
        devices?.map((device, i) => {
          const Icon = icons[device._id] || Monitor;
          return (
            <motion.div
              key={device._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 border border-border/70 bg-card/50 rounded-2xl hover:border-border transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-all">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-black text-emerald-400">{device.percentage}%</span>
              </div>
              <h4 className="text-lg font-black text-foreground capitalize mb-1">
                {device._id}
              </h4>
              <p className="text-xs text-muted-foreground">
                {device.count.toLocaleString()} visits
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-2">
                {device.uniqueCount?.toLocaleString()} unique
              </p>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

/**
 * Location Card
 */
export const LocationCard = ({ location, type = 'country', maxVisitors = 0 }) => {
  const relativeWidth = maxVisitors > 0
    ? Math.min(100, (location.visitors / maxVisitors) * 100)
    : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 border border-border/70 bg-card/50 rounded-xl hover:border-border transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 group-hover:scale-110 transition-all">
            <Globe className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">
              {location[type]}
            </h4>
            {type === 'city' && (
              <p className="text-xs text-muted-foreground truncate">
                {location.country}
              </p>
            )}
          </div>
        </div>
        <span className="text-sm font-black text-accent whitespace-nowrap ml-2">
          {location.visitors}
        </span>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${relativeWidth}%` }}
          className="h-full bg-gradient-to-r from-accent to-accent shadow-accent/20"
        />
      </div>
    </motion.div>
  );
};

/**
 * Real-time Activity Feed
 */
export const RealTimeActivityFeed = ({ activities, isLoading }) => {
  return (
    <div className="border border-border/70 bg-card/40 rounded-[2rem] p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[80px] -mr-16 -mt-16 group-hover:bg-accent/10 transition-all" />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shadow-sm" />
        <h3 className="text-lg font-black italic uppercase tracking-tighter">
          Real-time Activity
        </h3>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-muted-foreground">Loading activity...</span>
            </div>
          </div>
        ) : activities && activities.length > 0 ? (
          activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 border border-border/70 bg-card/50 rounded-xl hover:border-border transition-all border-l-2 border-l-transparent hover:border-l-accent"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 mt-1">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    Visitor on <span className="text-accent italic">{activity.page}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.country} • {activity.device}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 mt-2 font-black italic uppercase tracking-widest">
                    {activity.timeAgo}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <span className="text-sm text-muted-foreground opacity-50">No recent activity</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Metric Card
 */
export const MetricCard = ({
  label,
  value,
  trend,
  trendLabel = 'Change',
  trendDirection = 'neutral',
  icon: Icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-accent/10 text-accent border-accent/20 shadow-accent/5',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-violet-500/5',
  };
  const isDown = trendDirection === 'down';
  const isUp = trendDirection === 'up';
  const TrendIcon = isDown ? TrendingDown : TrendingUp;
  const trendClasses = isDown
    ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : isUp
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : 'text-muted-foreground bg-muted/50 border-border';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="p-8 border border-border/70 bg-card/50 rounded-3xl relative overflow-hidden group transition-all duration-500"
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity ${colorClasses[color].split(' ')[0]}`} />

      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl border ${colorClasses[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">{trendLabel}</span>
            <span className={`text-xs font-black flex items-center gap-1 px-2 py-1 rounded-full border ${trendClasses}`}>
              {(isUp || isDown) && <TrendIcon className="w-3 h-3" />}
              {trend}
            </span>
          </div>
        )}
      </div>

      <h4 className="text-3xl font-black italic tracking-tighter text-foreground mb-1 group-hover:text-accent transition-colors">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </h4>
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
        {label}
      </p>
    </motion.div>
  );
};
