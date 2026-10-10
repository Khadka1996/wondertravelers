'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, Cloud, ExternalLink, Globe2, RefreshCw } from 'lucide-react';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => <div className="aspect-[2/1] animate-pulse rounded bg-slate-100" />,
});

// ------------------------------------------------------------------ types

type RangeKey = '24h' | '7d' | '30d' | '90d' | '1y';
interface Totals { requests: number; cachedRequests: number; bytes: number; cachedBytes: number; pageViews: number; threats: number; uniques: number }
interface Row { key: string; requests: number; en?: number; ne?: number }
interface CloudflareData {
  connected: boolean;
  range: RangeKey;
  label: string;
  hourly: boolean;
  generatedAt: string;
  totals: Totals;
  previous: Totals | null;
  points: { time: string; requests: number; cachedRequests: number; uncachedRequests: number; bytes: number; cachedBytes: number; pageViews: number; threats: number; uniques: number }[];
  countries: { key: string; requests: number; threats: number; bytes: number }[];
  contentTypes: { key: string; requests: number; bytes: number }[];
  breakdowns: { days: number; topPages: Row[]; hosts: Row[]; devices: Row[]; browsers: Row[]; os: Row[]; statuses: Row[]; errorPaths: Row[] };
}

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '24h', label: 'Previous 24 hours', days: 1 },
  { key: '7d', label: 'Previous 7 days', days: 7 },
  { key: '30d', label: 'Previous 30 days', days: 30 },
  { key: '90d', label: 'Previous 90 days', days: 90 },
  { key: '1y', label: 'Previous year', days: 365 },
];

type Metric = 'requests' | 'bytes' | 'uniques' | 'pageViews' | 'threats';
const METRICS: { key: Metric; label: string }[] = [
  { key: 'requests', label: 'Requests' },
  { key: 'bytes', label: 'Bandwidth' },
  { key: 'uniques', label: 'Unique visitors' },
  { key: 'pageViews', label: 'Page views' },
  { key: 'threats', label: 'Threats' },
];

// Cloudflare dashboard colours.
const CF_ORANGE = '#f6821f';
const CF_BLUE = '#0051c3';

// ---------------------------------------------------------------- helpers

const nf = new Intl.NumberFormat('en-US');
const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: n >= 1e6 ? 2 : 1 }).format(n);
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryName = (code: string) => {
  if (code === 'T1') return 'Tor network';
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX') return 'Unknown';
  try { return regionNames.of(code) || code; } catch { return code; }
};
const flag = (code: string) => (/^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '🌐');
const bytes = (n: number) => {
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
  return `${n.toFixed(n < 10 && i ? 2 : n < 100 && i ? 1 : 0)} ${units[i]}`;
};
const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);
const delta = (now: number, before?: number | null) => (before ? ((now - before) / before) * 100 : null);
const statusLabel: Record<string, string> = { '200': 'OK', '204': 'No content', '206': 'Partial content', '301': 'Moved permanently', '302': 'Found', '304': 'Not modified', '307': 'Temporary redirect', '308': 'Permanent redirect', '400': 'Bad request', '401': 'Unauthorized', '403': 'Forbidden', '404': 'Not found', '405': 'Method not allowed', '429': 'Too many requests', '499': 'Client closed', '500': 'Server error', '502': 'Bad gateway', '503': 'Unavailable', '504': 'Gateway timeout' };
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const pageLabel = (path: string) => {
  if (path === '/') return 'Home page';
  const parts = path.split('/').filter(Boolean);
  const last = decodeURIComponent(parts[parts.length - 1] || '').replace(/-/g, ' ');
  return parts.length === 1 ? `${titleCase(last)} page` : titleCase(last);
};

// ------------------------------------------------------------- components

function Tile({ label, value, sub, change, invert = false }: { label: string; value: string; sub?: string; change?: number | null; invert?: boolean }) {
  const good = change === null || change === undefined ? null : invert ? change <= 0 : change >= 0;
  return (
    <div className="border-b border-r border-gray-200 px-5 py-4 lg:border-b-0 lg:last:border-r-0">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{value}</div>
      <div className="mt-1 flex items-center gap-1 text-xs">
        {change !== null && change !== undefined && (
          <span className={`flex items-center font-medium ${good ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-gray-500">{sub}</span>}
      </div>
    </div>
  );
}

function Panel({ title, note, children, action }: { title: string; note?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-gray-200 bg-white">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {note && <p className="text-xs text-gray-500">{note}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Breakdown({ rows, format = (r: Row) => r.key }: { rows: Row[]; format?: (r: Row) => React.ReactNode }) {
  const sum = rows.reduce((s, r) => s + r.requests, 0);
  if (!rows.length) return <p className="text-sm text-gray-500">No data</p>;
  return (
    <table className="w-full table-fixed text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-b border-gray-100 last:border-0">
            <td className="py-2 pr-3">
              <div className="truncate text-gray-800">{format(r)}</div>
              <div className="mt-1 h-1 rounded bg-gray-100">
                <div className="h-1 rounded" style={{ width: `${Math.max(2, pct(r.requests, rows[0].requests))}%`, background: CF_BLUE }} />
              </div>
            </td>
            <td className="w-16 py-2 text-right tabular-nums text-gray-900">{compact(r.requests)}</td>
            <td className="w-14 py-2 text-right tabular-nums text-gray-500">{pct(r.requests, sum).toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ------------------------------------------------------------------- page

export default function CloudflareAnalyticsPage() {
  const [range, setRange] = useState<RangeKey>('7d');
  const [metric, setMetric] = useState<Metric>('requests');
  const [data, setData] = useState<CloudflareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/analytics/cloudflare?range=${range}${refresh ? '&refresh=1' : ''}`, { credentials: 'include' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Could not load Cloudflare analytics');
      setData(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load Cloudflare analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const t = data?.totals;
  const p = data?.previous;
  const mapData = useMemo(() => (data?.countries || []).map((c) => ({ code: c.key, value: c.requests })), [data]);
  const chartData = useMemo(() => (data?.points || []).map((pt) => ({ ...pt, uncachedBytes: pt.bytes - pt.cachedBytes })), [data]);
  const formatTime = (time: string) =>
    data?.hourly
      ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date(`${time}T00:00:00`).toLocaleDateString([], { month: 'short', day: 'numeric' });
  const formatValue = (v: number) => (metric === 'bytes' ? bytes(v) : nf.format(v));
  const rangeDays = RANGES.find((r) => r.key === range)?.days ?? 7;
  const adaptiveNote = data && data.breakdowns.days < rangeDays ? `Last ${data.breakdowns.days} days (Cloudflare free plan limit)` : undefined;
  const metricColor = metric === 'threats' ? '#dc2626' : CF_BLUE;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md" style={{ background: CF_ORANGE }}>
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Traffic analytics</h1>
            <p className="text-xs text-gray-500">
              wondertravelers.com · Cloudflare
              {data?.generatedAt && <> · updated {new Date(data.generatedAt).toLocaleTimeString()}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <a
            href="https://dash.cloudflare.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1 rounded-md px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 sm:flex"
          >
            Open Cloudflare <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {data && !data.connected && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Cloudflare is not connected. Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID to the server settings.
        </div>
      )}

      {!data && loading && <div className="h-96 animate-pulse rounded-md bg-white" />}

      {data?.connected && t && (
        <>
          {/* Summary tiles */}
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 bg-white md:grid-cols-3 lg:grid-cols-6">
            <Tile label="Unique visitors" value={compact(t.uniques)} change={delta(t.uniques, p?.uniques)} />
            <Tile label="Total requests" value={compact(t.requests)} change={delta(t.requests, p?.requests)} />
            <Tile label="Percent cached" value={`${pct(t.cachedRequests, t.requests).toFixed(1)}%`} sub={`${compact(t.cachedRequests)} cached`} />
            <Tile label="Total data served" value={bytes(t.bytes)} change={delta(t.bytes, p?.bytes)} />
            <Tile label="Data cached" value={bytes(t.cachedBytes)} sub={`${pct(t.cachedBytes, t.bytes).toFixed(1)}% of data`} />
            <Tile label="Threats blocked" value={compact(t.threats)} change={delta(t.threats, p?.threats)} invert />
          </div>

          {/* Main chart */}
          <section className="rounded-md border border-gray-200 bg-white">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 px-3 pt-2">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${metric === m.key ? 'border-[#0051c3] text-[#0051c3]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="p-5">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
                {metric === 'requests' || metric === 'bytes' ? (
                  <>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CF_ORANGE }} />Cached</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CF_BLUE }} />Uncached</span>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: metricColor }} />{METRICS.find((m) => m.key === metric)?.label}</span>
                )}
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
                    <XAxis dataKey="time" tickFormatter={formatTime} fontSize={11} minTickGap={28} stroke="#9ca3af" />
                    <YAxis fontSize={11} stroke="#9ca3af" width={64} tickFormatter={(v: number) => (metric === 'bytes' ? bytes(v) : compact(v))} />
                    <Tooltip labelFormatter={(l) => formatTime(String(l))} formatter={(v) => formatValue(Number(v))} />
                    {metric === 'requests' && (
                      <>
                        <Area type="monotone" dataKey="cachedRequests" name="Cached" stackId="1" stroke={CF_ORANGE} fill={CF_ORANGE} fillOpacity={0.55} isAnimationActive={false} />
                        <Area type="monotone" dataKey="uncachedRequests" name="Uncached" stackId="1" stroke={CF_BLUE} fill={CF_BLUE} fillOpacity={0.45} isAnimationActive={false} />
                      </>
                    )}
                    {metric === 'bytes' && (
                      <>
                        <Area type="monotone" dataKey="cachedBytes" name="Cached" stackId="1" stroke={CF_ORANGE} fill={CF_ORANGE} fillOpacity={0.55} isAnimationActive={false} />
                        <Area type="monotone" dataKey="uncachedBytes" name="Uncached" stackId="1" stroke={CF_BLUE} fill={CF_BLUE} fillOpacity={0.45} isAnimationActive={false} />
                      </>
                    )}
                    {metric !== 'requests' && metric !== 'bytes' && (
                      <Area
                        type="monotone"
                        dataKey={metric}
                        name={METRICS.find((m) => m.key === metric)?.label}
                        stroke={metricColor}
                        fill={metricColor}
                        fillOpacity={0.3}
                        isAnimationActive={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Countries */}
          <Panel title="Traffic by country" note={`${data.countries.length} countries`} action={<Globe2 className="h-4 w-4 text-gray-400" />}>
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <WorldMap data={mapData} label="requests" />
              </div>
              <div className="max-h-[420px] overflow-y-auto lg:col-span-2">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white text-xs text-gray-500">
                    <tr className="border-b border-gray-200">
                      <th className="py-2 text-left font-medium">Country</th>
                      <th className="py-2 text-right font-medium">Requests</th>
                      <th className="py-2 text-right font-medium">Threats</th>
                      <th className="py-2 text-right font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.countries.slice(0, 25).map((c) => (
                      <tr key={c.key} className="border-b border-gray-100">
                        <td className="py-2 text-gray-800">{flag(c.key)} {countryName(c.key)}</td>
                        <td className="py-2 text-right tabular-nums">{compact(c.requests)}</td>
                        <td className={`py-2 text-right tabular-nums ${c.threats ? 'text-red-600' : 'text-gray-400'}`}>{compact(c.threats)}</td>
                        <td className="py-2 text-right tabular-nums text-gray-600">{bytes(c.bytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* Top pages + status codes */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Panel title="Top 10 pages" note={adaptiveNote || 'Successful page loads by real browsers; /en, /ne and old links merged'}>
                {data.breakdowns.topPages.length ? (
                  <ol className="divide-y divide-gray-100">
                    {data.breakdowns.topPages.map((page, index) => (
                      <li key={page.key} className="flex items-center gap-4 py-2.5">
                        <span className="w-5 text-right text-sm font-semibold text-gray-400">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <a href={`/en${page.key === '/' ? '' : page.key}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-[#0051c3]">
                            <span className="truncate">{pageLabel(page.key)}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-gray-400" />
                          </a>
                          <div className="truncate text-xs text-gray-500">{page.key}</div>
                          <div className="mt-1 h-1 rounded bg-gray-100">
                            <div className="h-1 rounded" style={{ width: `${pct(page.requests, data.breakdowns.topPages[0].requests)}%`, background: CF_ORANGE }} />
                          </div>
                        </div>
                        <div className="w-24 text-right">
                          <div className="text-sm font-semibold tabular-nums text-gray-900">{nf.format(page.requests)}</div>
                          <div className="text-[11px] text-gray-500">EN {compact(page.en || 0)} · NE {compact(page.ne || 0)}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-500">No page loads in this period.</p>
                )}
              </Panel>
            </div>
            <Panel title="Status codes" note={adaptiveNote}>
              <Breakdown
                rows={data.breakdowns.statuses}
                format={(r) => (
                  <>
                    <span className={`mr-2 font-mono font-semibold ${r.key.startsWith('2') ? 'text-emerald-600' : r.key.startsWith('3') ? 'text-blue-600' : 'text-red-600'}`}>{r.key}</span>
                    {statusLabel[r.key] || ''}
                  </>
                )}
              />
            </Panel>
          </div>

          {/* Visitor breakdowns */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Panel title="Devices" note={adaptiveNote}>
              <Breakdown rows={data.breakdowns.devices} format={(r) => titleCase(r.key || 'Unknown')} />
            </Panel>
            <Panel title="Browsers" note={adaptiveNote}>
              <Breakdown rows={data.breakdowns.browsers} />
            </Panel>
            <Panel title="Operating systems" note={adaptiveNote}>
              <Breakdown rows={data.breakdowns.os} />
            </Panel>
            <Panel title="Content types">
              <Breakdown rows={data.contentTypes} format={(r) => titleCase(r.key || 'other')} />
            </Panel>
            <Panel title="Hostnames" note={adaptiveNote}>
              <Breakdown rows={data.breakdowns.hosts} />
            </Panel>
            <Panel title="Most frequent errors" note={adaptiveNote || 'Paths answered with 4xx/5xx'}>
              <Breakdown rows={data.breakdowns.errorPaths} format={(r) => <span className="font-mono text-xs">{r.key}</span>} />
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
