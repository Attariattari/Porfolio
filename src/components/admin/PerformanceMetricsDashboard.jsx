/**
 * Performance Metrics Dashboard Component
 *
 * Visualizes navigation performance metrics
 * Can be added to admin dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { navigationCache } from '@/lib/navigationCache';

export default function PerformanceMetricsDashboard() {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [recent, setRecent] = useState([]);
  const [cacheStats, setCacheStats] = useState(null);

  useEffect(() => {
    const updateMetrics = () => {
      setStats(performanceMonitor.getStats());
      setBreakdown(performanceMonitor.getTimingBreakdown());
      setRecent(performanceMonitor.getRecent(10));
      setCacheStats(navigationCache.getStats());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="p-4">Loading metrics...</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Metrics Cards */}
        <MetricCard
          label="Total Navigations"
          value={stats.totalNavigations}
          unit=""
        />
        <MetricCard
          label="Avg Duration"
          value={stats.averageDuration}
          unit="ms"
          color="blue"
        />
        <MetricCard
          label="Cache Hit Rate"
          value={stats.cacheHitRate}
          unit="%"
          color="green"
        />
        <MetricCard
          label="Loader Shown"
          value={stats.loaderShownRate}
          unit="%"
          color="amber"
        />
      </div>

      {/* Timing Breakdown */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Timing Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TimingBar
            label="Instant"
            value={breakdown.instant}
            total={breakdown.total}
            color="var(--status-success)"
          />
          <TimingBar
            label="Fast"
            value={breakdown.fast}
            total={breakdown.total}
            color="var(--chart-1)"
          />
          <TimingBar
            label="Moderate"
            value={breakdown.moderate}
            total={breakdown.total}
            color="var(--status-warning)"
          />
          <TimingBar
            label="Slow"
            value={breakdown.slow}
            total={breakdown.total}
            color="var(--status-danger)"
          />
          <TimingBar
            label="Very Slow"
            value={breakdown.verySlow}
            total={breakdown.total}
            color="var(--chart-5)"
          />
        </div>
      </div>

      {/* Cache Statistics */}
      {cacheStats && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Cache Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Active Entries"
              value={cacheStats.activeEntries}
              unit=""
              color="blue"
            />
            <MetricCard
              label="Expired Entries"
              value={cacheStats.expiredEntries}
              unit=""
              color="amber"
            />
            <MetricCard
              label="Total Entries"
              value={cacheStats.totalEntries}
              unit=""
              color="green"
            />
            <MetricCard
              label="Size"
              value={cacheStats.estimatedSizeKB}
              unit="KB"
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Recent Navigations */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Navigations</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {recent.map((nav, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-background/50 rounded border border-border/30 text-sm"
            >
              <div>
                <span className="font-mono text-foreground/80">{nav.route}</span>
                <span className="text-muted-foreground ml-2">
                  {nav.isRepeatVisit ? '🔄' : '🆕'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-semibold ${
                    nav.duration < 300
                      ? 'text-green-500'
                      : nav.duration < 1000
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                >
                  {nav.duration.toFixed(0)}ms
                </span>
                {nav.fromCache && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-semibold">
                    Cached
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-background border border-border rounded-lg p-4 text-xs font-mono text-muted-foreground">
        <p>💡 Tip: Set sessionStorage.setItem(&apos;show-perf-metrics&apos;, &apos;true&apos;) in the console to see detailed metrics logs.</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color = 'default' }) {
  const colorClasses = {
    default: 'text-foreground',
    blue: 'text-accent',
    green: 'text-green-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 text-center">
      <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value}
        <span className="text-sm text-muted-foreground ml-1">{unit}</span>
      </p>
    </div>
  );
}

function TimingBar({ label, value, total, color }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="text-center">
      <div className="relative h-32 bg-background border border-border rounded mb-2 flex items-end justify-center overflow-hidden">
        <div
          style={{
            height: `${percentage}%`,
            backgroundColor: color,
            minHeight: '4px',
            width: '100%',
            opacity: 0.7,
          }}
        />
      </div>
      <p className="text-xs font-semibold">{label}</p>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
    </div>
  );
}
