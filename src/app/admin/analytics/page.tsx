'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, FileText, Eye, Navigation, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

interface WebAnalyticsData {
  summary: {
    totalVisits: number;
    totalPages: number;
    avgVisitsPerDay: number;
    avgPagesPerDay: number;
    avgVisitsPerPage: number;
    period: string;
  };
  daily: Array<{
    date: string;
    visits: number;
    uniqueVisitors: number;
    pagesVisited: number;
  }>;
  weekly: Array<{
    week: string;
    visits: number;
    uniqueVisitors: number;
    pagesVisited: number;
    startDate: string;
    endDate: string;
  }>;
  monthly: Array<{
    month: string;
    visits: number;
    uniqueVisitors: number;
    pagesVisited: number;
  }>;
  yearly: Array<{
    year: number;
    visits: number;
    uniqueVisitors: number;
    pagesVisited: number;
  }>;
  pageMetrics: Array<{
    path: string;
    visits: number;
    uniqueVisitors: number;
    countriesServed: number;
    bounceRateEstimate: number;
    lastVisit: string;
  }>;
  hourlyHeatmap: Array<{
    hour: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  dayOfWeekHeatmap: Array<{
    day: string;
    visits: number;
    uniqueVisitors: number;
  }>;
  timestamp: string;
}

export default function AnalyticsDashboard() {
  const [webAnalytics, setWebAnalytics] = useState<WebAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  const getDefaultAnalyticsData = useCallback((): WebAnalyticsData => ({
    summary: {
      totalVisits: 0,
      totalPages: 0,
      avgVisitsPerDay: 0,
      avgPagesPerDay: 0,
      avgVisitsPerPage: 0,
      period: `Last ${timeRange} days`,
    },
    daily: [],
    weekly: [],
    monthly: [],
    yearly: [],
    pageMetrics: [],
    hourlyHeatmap: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      visits: 0,
      uniqueVisitors: 0,
    })),
    dayOfWeekHeatmap: [
      { day: 'Sunday', visits: 0, uniqueVisitors: 0 },
      { day: 'Monday', visits: 0, uniqueVisitors: 0 },
      { day: 'Tuesday', visits: 0, uniqueVisitors: 0 },
      { day: 'Wednesday', visits: 0, uniqueVisitors: 0 },
      { day: 'Thursday', visits: 0, uniqueVisitors: 0 },
      { day: 'Friday', visits: 0, uniqueVisitors: 0 },
      { day: 'Saturday', visits: 0, uniqueVisitors: 0 },
    ],
    timestamp: new Date().toISOString(),
  }), [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/analytics/detailed-web-analytics?days=${timeRange}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setWebAnalytics(data.data || getDefaultAnalyticsData());
      } else {
        // Show default data if response fails
        setWebAnalytics(getDefaultAnalyticsData());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Show default data with zeros on error
      setWebAnalytics(getDefaultAnalyticsData());
    } finally {
      setLoading(false);
    }
  }, [timeRange, getDefaultAnalyticsData]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const processedData = useMemo(() => {
    if (!webAnalytics) return null;

    // Real engagement metrics from actual data
    const totalVisits = webAnalytics.summary?.totalVisits || 0;
    const totalUniqueVisitors = webAnalytics.daily?.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0) || 0;
    const engagementData = [
      { metric: 'Total Views', value: totalVisits },
      { metric: 'Unique Visitors', value: totalUniqueVisitors },
      { metric: 'Pages Viewed', value: webAnalytics.summary?.totalPages || 0 },
      { metric: 'Avg Views/Day', value: webAnalytics.summary?.avgVisitsPerDay || 0 },
      { metric: 'Avg Pages/Day', value: webAnalytics.summary?.avgPagesPerDay || 0 },
    ];

    // Real bounce rates from page metrics
    const avgBounceRate = webAnalytics.pageMetrics?.length > 0
      ? Math.round(webAnalytics.pageMetrics.reduce((sum, p) => sum + p.bounceRateEstimate, 0) / webAnalytics.pageMetrics.length)
      : 0;

    // Real page distribution (top pages by visits)
    const topPagesData = (webAnalytics.pageMetrics || []).slice(0, 5).map((page) => ({
      name: page.path.split('/').pop() || 'home',
      visits: page.visits,
      uniqueVisitors: page.uniqueVisitors,
    }));

    return {
      engagementData,
      avgBounceRate,
      topPagesData,
      totalVisits,
      totalUniqueVisitors,
    };
  }, [webAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#174fa2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Analytics system initialized. Data will appear when tracking starts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive platform analytics and engagement metrics</p>
          </div>
          <div className="flex gap-2">
            {['7', '30', '90'].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === days
                    ? 'bg-[#174fa2] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Last updated: {new Date(webAnalytics?.timestamp || new Date()).toLocaleString()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Visits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Visits</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.totalVisits?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-2">{webAnalytics?.daily?.length || 0} days tracked</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Navigation className="w-6 h-6 text-[#174fa2]" />
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{(webAnalytics?.daily?.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0) || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">Individual users</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pages Visited */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pages Tracked</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.pageMetrics?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Unique pages</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Avg Bounce Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Bounce Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{processedData?.avgBounceRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-2">Across all pages</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Real Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Data */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Real-Time Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={processedData?.engagementData || []}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="metric" type="category" width={140} />
              <Tooltip />
              <Bar dataKey="value" fill="#174fa2" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Pages by Visits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Pages by Visits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData?.topPagesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill="#174fa2" name="Visits" radius={[8, 8, 0, 0]} />
              <Bar dataKey="uniqueVisitors" fill="#4CAF50" name="Unique Visitors" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PAGE VISIT ANALYTICS SECTION */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Visit Analytics</h2>
        <p className="text-gray-600">{webAnalytics?.summary?.period} - Total: <span className="font-bold text-[#174fa2]">{webAnalytics?.summary?.totalVisits || 0}</span> visits</p>
      </div>

      {/* Page Visit KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Visits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Visits</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.totalVisits || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Navigation className="w-6 h-6 text-[#174fa2]" />
            </div>
          </div>
        </div>

        {/* Total Pages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pages Visited</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.totalPages || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Avg Per Day */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Visits/Day</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.avgVisitsPerDay || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Avg Pages Per Day */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Pages/Day</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.avgPagesPerDay || 0}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Avg Per Page */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Visits/Page</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{webAnalytics?.summary?.avgVisitsPerPage || 0}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Traffic */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Traffic ({webAnalytics?.daily?.length || 0} days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={webAnalytics?.daily || []}>   
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" stroke="#174fa2" name="Visits" isAnimationActive={false} />
              <Line type="monotone" dataKey="uniqueVisitors" stroke="#4CAF50" name="Unique Visitors" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Traffic */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Traffic ({webAnalytics?.monthly?.length || 0} months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={webAnalytics?.monthly || []}>   
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill="#174fa2" name="Visits" />
              <Bar dataKey="uniqueVisitors" fill="#4CAF50" name="Unique Visitors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Hourly Traffic */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={webAnalytics?.hourlyHeatmap || []}>   
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#FF9800" name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Day of Week */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={webAnalytics?.dayOfWeekHeatmap || []}>   
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#2196F3" name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top {Math.min(10, webAnalytics?.pageMetrics?.length || 0)} Pages</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Page Path</th>
                <th className="px-4 py-3 text-center font-semibold">Visits</th>
                <th className="px-4 py-3 text-center font-semibold">Unique Visitors</th>
                <th className="px-4 py-3 text-center font-semibold">Countries</th>
                <th className="px-4 py-3 text-center font-semibold">Bounce Rate %</th>
              </tr>
            </thead>
            <tbody>
              {(webAnalytics?.pageMetrics || []).slice(0, 10).map((page, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-[#174fa2]">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-blue-600 truncate max-w-xs">{page.path}</td>
                  <td className="px-4 py-3 text-center font-bold">{page.visits}</td>
                  <td className="px-4 py-3 text-center">{page.uniqueVisitors}</td>
                  <td className="px-4 py-3 text-center">{page.countriesServed}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${page.bounceRateEstimate > 70 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {page.bounceRateEstimate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly & Yearly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Breakdown ({webAnalytics?.weekly?.length || 0} weeks)</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(webAnalytics?.weekly || []).map((week, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Week {week.week}</p>
                  <p className="text-xs text-gray-500">{new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#174fa2]">{week.visits} visits</p>
                  <p className="text-xs text-gray-500">{week.uniqueVisitors} unique</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Yearly Breakdown ({webAnalytics?.yearly?.length || 0} years)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={webAnalytics?.yearly || []}>   
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visits" fill="#174fa2" name="Visits" />
              <Bar dataKey="uniqueVisitors" fill="#4CAF50" name="Unique Visitors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📊 Traffic Insights</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Most visited: <strong>{webAnalytics?.pageMetrics?.[0]?.path || 'N/A'}</strong></li>
            <li>✓ Peak traffic hour: <strong>{(webAnalytics?.hourlyHeatmap?.length ? webAnalytics.hourlyHeatmap.reduce((max, h) => h.visits > max.visits ? h : max, webAnalytics.hourlyHeatmap[0]).hour : '0:00')}</strong></li>
            <li>✓ Peak traffic day: <strong>{(webAnalytics?.dayOfWeekHeatmap?.length ? webAnalytics.dayOfWeekHeatmap.reduce((max, d) => d.visits > max.visits ? d : max, webAnalytics.dayOfWeekHeatmap[0]).day : 'N/A')}</strong></li>
            <li>✓ Total unique visitors: <strong>{webAnalytics?.daily?.reduce((sum, d) => sum + (d?.uniqueVisitors || 0), 0) || 0}</strong></li>
          </ul>
        </div>

        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-bold text-green-900 mb-3">✅ Performance Summary</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>✓ Avg daily visits: <strong>{webAnalytics?.summary?.avgVisitsPerDay || 0}</strong></li>
            <li>✓ Avg pages per day: <strong>{webAnalytics?.summary?.avgPagesPerDay || 0}</strong></li>
            <li>✓ Pages with visits: <strong>{webAnalytics?.summary?.totalPages || 0}</strong></li>
            <li>✓ Avg visits per page: <strong>{webAnalytics?.summary?.avgVisitsPerPage || 0}</strong></li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          📈 Analytics Dashboard - All metrics tracked in real-time. Last updated: <strong>{new Date(webAnalytics?.timestamp || new Date()).toLocaleTimeString()}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Daily, Weekly, Monthly & Yearly breakdowns available. Bounce rate estimates: High bounce (red) = fewer repeat visits to page
        </p>
      </div>
    </div>
  );
}