"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { disposeSocket, initializeSocket } from '@/lib/socket';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Globe,
  Monitor,
  FileText,
  Calendar,
  Filter,
  Download,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

async function fetchAnalyticsData(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || payload.message || 'Analytics request failed');
  }
  return payload.data;
}

import {
  EnhancedVisitorChart,
  MonthlyGrowthComparisonChart,
  HourlyBreakdownChart,
  DeviceDistributionChart,
  TopPagesChart,
  GeoDistributionChart,
} from '@/components/admin/AnalyticsCharts';

import {
  MetricCard,
  DeviceStatsGrid,
  LocationCard,
  RealTimeActivityFeed,
  AnalyticsTable,
} from '@/components/admin/AnalyticsComponents';

export default function VisitorAnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [view, setView] = useState('daily');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const queryClient = useQueryClient();

  // Socket initialization for real-time updates
  useEffect(() => {
    const socket = initializeSocket();
    if (socket) {
      socket.on('STATS_UPDATED', (data) => {
        console.log('[Real-time] Stats updated:', data);
        queryClient.invalidateQueries({ queryKey: ['analytics-visitors'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-devices'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-pages'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-geo'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-active'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-monthly-growth'] });
      });

      socket.on('new_visitor', (data) => {
        queryClient.invalidateQueries({ queryKey: ['analytics-visitors'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-monthly-growth'] });
        const visitType = data.isFirstVisit ? 'New visitor' : 'Returning visitor';
        toast.info(`${visitType} from ${data.country} on ${data.page}`, {
          icon: <Activity className="w-4 h-4 text-emerald-400" />,
          duration: 3000,
        });
      });
    }

    return () => {
      disposeSocket(socket);
    };
  }, [queryClient]);

  // Queries with shorter polling intervals for "0 delay" feel
  const { data: visitorsData, isLoading: visitorsLoading, isFetching: visitorsFetching } = useQuery({
    queryKey: ['analytics-visitors', period, view],
    queryFn: () => fetchAnalyticsData(`/api/admin/analytics/visitors?period=${period}&view=${view}`),
    refetchInterval: 5000,
  });

  const { data: devicesData, isLoading: devicesLoading } = useQuery({
    queryKey: ['analytics-devices', period],
    queryFn: () => fetchAnalyticsData(`/api/admin/analytics/devices?period=${period}`),
    refetchInterval: 10000,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ['analytics-pages', period],
    queryFn: () => fetchAnalyticsData(`/api/admin/analytics/pages?period=${period}`),
    refetchInterval: 10000,
  });

  const { data: geoData, isLoading: geoLoading } = useQuery({
    queryKey: ['analytics-geo', period],
    queryFn: () => fetchAnalyticsData(`/api/admin/analytics/geo?period=${period}`),
    refetchInterval: 10000,
  });

  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ['analytics-active'],
    queryFn: () => fetchAnalyticsData('/api/admin/analytics/active'),
    refetchInterval: 5000,
  });

  const { data: monthlyGrowth, isLoading: monthlyGrowthLoading } = useQuery({
    queryKey: ['analytics-monthly-growth', selectedMonth],
    queryFn: () => fetchAnalyticsData(`/api/admin/analytics/monthly-growth?month=${selectedMonth}`),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const monthOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    return {
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    };
  }), []);

  // Memoized stats
  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return '—';
    if (seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const stats = useMemo(() => {
    const growthRate = visitorsData?.stats?.growthRate;
    const hasGrowth = typeof growthRate === 'number';
    const measuredSessions = visitorsData?.stats?.measuredSessions;

    return [
      {
        label: 'Page Views',
        value: visitorsData?.stats?.totalPageViews ?? '—',
        trend: `Last ${period}d`,
        trendLabel: 'Period',
        icon: FileText,
        color: 'blue',
      },
      {
        label: 'Unique Visitors',
        value: visitorsData?.stats?.uniqueVisitors ?? '—',
        trend: hasGrowth
          ? `${growthRate > 0 ? '+' : ''}${growthRate}%`
          : (visitorsData?.stats?.growthStatus || 'Collecting verified baseline'),
        trendLabel: `vs prior ${period}d`,
        trendDirection: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
        icon: Users,
        color: 'emerald',
      },
      {
        label: 'Bounce Rate',
        value: visitorsData?.stats?.bounceRate === null || visitorsData?.stats?.bounceRate === undefined
          ? '—'
          : `${visitorsData.stats.bounceRate}%`,
        trend: measuredSessions ? `${measuredSessions} measured` : 'Awaiting verified sessions',
        trendLabel: 'Data quality',
        icon: Activity,
        color: 'amber',
      },
      {
        label: 'Avg Session',
        value: formatDuration(visitorsData?.stats?.avgSessionDuration),
        trend: measuredSessions ? 'Verified sessions' : 'No verified sessions yet',
        trendLabel: 'Scope',
        icon: Zap,
        color: 'violet',
      },
    ];
  }, [visitorsData, period]);

  const handleExport = async () => {
    try {
      // Prepare CSV data
      const csvContent = [
        ['Visitor Analytics Report', `Period: Last ${period} days`],
        [],
        ['Metric', 'Value'],
        ['Page Views', visitorsData?.stats?.totalPageViews ?? ''],
        ['Unique Visitors', visitorsData?.stats?.uniqueVisitors ?? ''],
        ['Growth vs previous period', visitorsData?.stats?.growthRate ?? ''],
        ['Bounce Rate', visitorsData?.stats?.bounceRate ?? ''],
        ['Avg Session Duration', visitorsData?.stats?.avgSessionDuration ?? ''],
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visitor-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2.5 rounded-xl border border-border hover:border-border hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
              Visitor Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Deep dive into traffic patterns and user behavior
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-1">
            {[7, 14, 30, 90].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  period === p
                    ? 'bg-accent text-background'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl hover:bg-accent/20 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <MetricCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Calendar Month Growth Comparison */}
      <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10 overflow-hidden relative">
        <div className={`absolute inset-x-0 top-0 h-1 ${monthlyGrowth?.growthRate < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              {monthlyGrowth?.growthRate < 0
                ? <TrendingDown className="w-7 h-7 text-red-400" />
                : <TrendingUp className="w-7 h-7 text-emerald-400" />}
              Monthly Growth Comparison
            </h2>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.1em]">
              Unique visitors compared with the previous calendar month
            </p>
          </div>
          {visitorsFetching && !visitorsLoading && (
            <span className="text-[9px] font-black uppercase tracking-widest text-accent animate-pulse">
              Updating {period} days
            </span>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select month</span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="min-w-52 bg-muted/60 border border-border rounded-xl px-4 py-3 text-xs font-bold text-foreground outline-none focus:border-accent"
            >
              {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {monthlyGrowthLoading ? (
          <div className="h-[480px] flex items-center justify-center"><Zap className="w-8 h-8 text-accent animate-pulse" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/70">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{monthlyGrowth?.monthLabel}</p>
                <p className="text-3xl font-black mt-2 tabular-nums">{monthlyGrowth?.currentVisitors?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Unique visitors</p>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/70">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{monthlyGrowth?.previousMonthLabel}</p>
                <p className="text-3xl font-black mt-2 tabular-nums">{monthlyGrowth?.previousVisitors?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Unique visitors</p>
              </div>
              <div className={`p-5 rounded-2xl border ${monthlyGrowth?.difference < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Net change</p>
                <p className={`text-3xl font-black mt-2 tabular-nums ${monthlyGrowth?.difference < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {monthlyGrowth?.difference > 0 ? '+' : ''}{monthlyGrowth?.difference || 0}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Visitors vs previous month</p>
              </div>
              <div className={`p-5 rounded-2xl border ${monthlyGrowth?.growthRate < 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Growth rate</p>
                <p className={`text-3xl font-black mt-2 tabular-nums ${monthlyGrowth?.growthRate < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {typeof monthlyGrowth?.growthRate === 'number'
                    ? `${monthlyGrowth.growthRate > 0 ? '+' : ''}${monthlyGrowth.growthRate}%`
                    : monthlyGrowth?.currentVisitors > 0 ? 'New' : '0%'}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Calendar-month comparison</p>
              </div>
            </div>
            <MonthlyGrowthComparisonChart
              data={monthlyGrowth?.daily}
              currentLabel={monthlyGrowth?.monthLabel}
              previousLabel={monthlyGrowth?.previousMonthLabel}
            />
          </>
        )}
      </div>

      {/* Main Chart Section */}
      <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-accent" />
              Visitor Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-[0.1em]">
              {view === 'daily' ? 'Daily unique visitors' : `Unique visitors by hour, last ${period} days`}
              {visitorsData?.range && (
                <span className="ml-2 text-accent">
                  {visitorsData.range.from} → {visitorsData.range.to}
                </span>
              )}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-1">
            <button
              onClick={() => setView('daily')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'daily'
                  ? 'bg-accent text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView('hourly')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                view === 'hourly'
                  ? 'bg-accent text-background'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hourly
            </button>
          </div>
        </div>

        <div className="mt-8">
          {visitorsLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-accent animate-pulse" />
            </div>
          ) : (
            <EnhancedVisitorChart
              data={view === 'daily' ? visitorsData?.trend : visitorsData?.hourly}
              view={view}
            />
          )}
        </div>
      </div>

      {/* Hourly Breakdown */}
      <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
          <Calendar className="w-7 h-7 text-indigo-400" />
          Hourly Breakdown · Last {period} Days
        </h2>
        {visitorsLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Zap className="w-8 h-8 text-accent animate-pulse" />
          </div>
        ) : (
          <HourlyBreakdownChart data={visitorsData?.hourly} />
        )}
      </div>

      {/* Device & Pages Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Devices */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <Monitor className="w-7 h-7 text-amber-400" />
            Device Breakdown
          </h2>
          {devicesLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-accent animate-pulse" />
            </div>
          ) : (
            <DeviceDistributionChart data={devicesData?.devices} />
          )}
        </div>

        {/* Top Pages */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <FileText className="w-7 h-7 text-emerald-400" />
            Top Pages
          </h2>
          {pagesLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-accent animate-pulse" />
            </div>
          ) : (
            <TopPagesChart data={pagesData?.topPages} />
          )}
        </div>
      </div>

      {/* Device Stats Grid */}
      <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
          <Activity className="w-7 h-7 text-violet-400" />
          Device Statistics
        </h2>
        <DeviceStatsGrid devices={devicesData?.devices} isLoading={devicesLoading} />
      </div>

      {/* Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Geography Chart */}
        <div className="lg:col-span-2 border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <Globe className="w-7 h-7 text-accent" />
            Traffic by Country
          </h2>
          {geoLoading ? (
            <div className="h-[350px] flex items-center justify-center">
              <Zap className="w-8 h-8 text-accent animate-pulse" />
            </div>
          ) : (
            <GeoDistributionChart data={geoData?.countries} />
          )}
        </div>

        {/* Real-time Activity */}
        <RealTimeActivityFeed activities={activeData?.recentActivity} isLoading={activeLoading} />
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Countries */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <Globe className="w-7 h-7 text-accent" />
            Top Countries
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {geoLoading ? (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 text-accent animate-pulse mx-auto" />
              </div>
            ) : geoData?.countries?.length > 0 ? (
                geoData.countries.map((country, i) => (
                <LocationCard key={i} location={country} type="country" maxVisitors={geoData.countries[0]?.visitors} />
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* Cities */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 mb-8">
            <MapPin className="w-7 h-7 text-accent" />
            Top Cities
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {geoLoading ? (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 text-accent animate-pulse mx-auto" />
              </div>
            ) : geoData?.cities?.length > 0 ? (
                geoData.cities.map((city, i) => (
                <LocationCard key={i} location={city} type="city" maxVisitors={geoData.cities[0]?.visitors} />
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Page Engagement Table */}
      <div>
        <AnalyticsTable
          title="Page Engagement Metrics"
          data={pagesData?.pageEngagement}
          columns={['Page', 'Visits', 'AvgSessionDuration', 'BounceRate', 'UniqueVisitors']}
          icon={FileText}
          isLoading={pagesLoading}
        />
      </div>

      {/* Browser & OS Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Browsers */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
            Top Browsers
          </h2>
          <div className="space-y-2">
            {devicesLoading ? (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 text-accent animate-pulse mx-auto" />
              </div>
            ) : devicesData?.browsers?.length > 0 ? (
              devicesData.browsers.map((browser, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/70 hover:border-border transition-all"
                >
                  <span className="text-sm font-bold text-foreground">{browser._id}</span>
                  <span className="text-xs font-black text-accent">
                    {browser.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* OS */}
        <div className="border border-border/70 bg-card/40 rounded-[2.5rem] p-8 md:p-10">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
            Operating Systems
          </h2>
          <div className="space-y-2">
            {devicesLoading ? (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 text-accent animate-pulse mx-auto" />
              </div>
            ) : devicesData?.operatingSystems?.length > 0 ? (
              devicesData.operatingSystems.map((os, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/70 hover:border-border transition-all"
                >
                  <span className="text-sm font-bold text-foreground">{os._id}</span>
                  <span className="text-xs font-black text-accent">
                    {os.count.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
