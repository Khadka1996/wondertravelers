'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { API_URL } from '@/lib/apiUrl';

interface AuditLog {
  _id?: string;
  action: string;
  category?: string;
  severity?: string;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
}

const SEVERITIES = ['', 'low', 'medium', 'high', 'critical'];

function severityBadge(sev?: string) {
  const map: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  };
  return map[sev || ''] || 'bg-gray-100 text-gray-700';
}

function formatDateTime(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function ReportsContent() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severity, setSeverity] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const [summary, setSummary] = useState({
    successful: 0,
    failed: 0,
    failureRate: 'N/A',
    suspicious: 0,
  });

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/moderator/security/summary?days=7`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      setSummary({
        successful: data?.data?.logins?.successful ?? 0,
        failed: data?.data?.logins?.failed ?? 0,
        failureRate: data?.data?.logins?.failureRate ?? 'N/A',
        suspicious: data?.data?.security?.suspiciousActivities ?? 0,
      });
    } catch {
      /* best-effort */
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ limit: '50' });
      if (severity) params.append('severity', severity);
      if (actionFilter) params.append('action', actionFilter.trim());

      const res = await fetch(`${API_URL}/api/moderator/audit-logs?${params}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Failed to load audit logs (HTTP ${res.status})`);
      }
      const data = await res.json();
      setLogs(data?.data?.logs || []);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [severity, actionFilter]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const t = setTimeout(fetchLogs, 400);
    return () => clearTimeout(t);
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reports &amp; Audit</h1>
        <p className="text-gray-600">Security summary and recent audit activity (last 7 days).</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Successful Logins</p>
          <p className="text-2xl font-bold text-green-600">{summary.successful}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Failed Logins</p>
          <p className="text-2xl font-bold text-red-600">{summary.failed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Failure Rate</p>
          <p className="text-2xl font-bold text-orange-600">{summary.failureRate}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 text-sm">Suspicious Events</p>
          <p className="text-2xl font-bold text-amber-600">{summary.suspicious}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Filter by action (e.g. login_failed)"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {SEVERITIES.map((s) => (
              <option key={s || 'all'} value={s}>
                {s ? s[0].toUpperCase() + s.slice(1) : 'All Severities'}
              </option>
            ))}
          </select>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Time</th>
                <th className="px-6 py-3 text-left font-semibold">Action</th>
                <th className="px-6 py-3 text-left font-semibold">Severity</th>
                <th className="px-6 py-3 text-left font-semibold">Details</th>
                <th className="px-6 py-3 text-left font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <Loader className="inline animate-spin text-amber-600" size={28} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No audit entries found
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log._id || i} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium">{log.action}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${severityBadge(
                          log.severity,
                        )}`}
                      >
                        {log.severity || 'n/a'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 max-w-md truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{log.ipAddress || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ModeratorReports() {
  return (
    <ProtectedRoute requiredRole={null}>
      <ReportsContent />
    </ProtectedRoute>
  );
}
