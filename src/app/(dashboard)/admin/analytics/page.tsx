'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Eye, Globe2, RefreshCw, Users, FileText, Shield, Search, Cloud, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import type { MapDatum } from './WorldMap';

const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => <div className="aspect-[2/1] animate-pulse rounded-lg bg-slate-100" />,
});

// ------------------------------------------------------------------ types

interface Totals { views: number; visitors: number }
interface Overview {
  days: number;
  generatedAt: string;
  site: {
    totals: Totals;
    previous: Totals;
    daily: { date: string; views: number; visitors: number }[];
    topPages: { path: string; views: number; visitors: number; en: number; ne: number }[];
    countries: { code: string; name: string; views: number; visitors: number }[];
    referrers: { source: string; views: number }[];
    devices: { device: string; views: number }[];
  };
  cloudflare: {
    connected: boolean;
    error?: string;
    totals?: { requests: number; cachedRequests: number; bytes: number; cachedBytes: number; pageViews: number; threats: number; uniques: number };
    daily?: { date: string; requests: number; pageViews: number; uniques: number; threats: number }[];
    countries?: { code: string; requests: number; threats: number }[];
  };
  google: {
    searchConsole: {
      connected: boolean;
      error?: string;
      totals?: { clicks: number; impressions: number; ctr: number; position: number };
      topQueries?: { key: string; clicks: number; impressions: number; ctr: number; position: number }[];
      topPages?: { key: string; clicks: number; impressions: number }[];
    };
    ga4: { connected: boolean; error?: string; totals?: { users: number; sessions: number; pageViews: number; avgSessionSeconds: number } };
  };
}

// ---------------------------------------------------------------- helpers

const RANGES = [7, 30, 90, 365];
const nf = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

const countryName = (code: string, fallback?: string) => {
  if (!code || code === 'XX' || code === 'T1') return fallback || 'Unknown';
  try {
    return regionNames.of(code) || fallback || code;
  } catch {
    return fallback || code;
  }
};
const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code) && code !== 'XX' ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '🌐';

const bytes = (n: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i ? 1 : 0)} ${units[i]}`;
};

/** "/blog/nag-panchami-in-nepal" -> { section: "Blog", title: "Nag panchami in nepal" } */
const describePage = (path: string) => {
  if (path === '/') return { section: 'Home', title: 'Home page' };
  const [first, ...rest] = path.split('/').filter(Boolean);
  const section = first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, ' ');
  if (!rest.length) return { section, title: `${section} page` };
  const slug = decodeURIComponent(rest.join('/')).replace(/-/g, ' ');
  return { section, title: slug.charAt(0).toUpperCase() + slug.slice(1) };
};

const change = (now: number, before: number) => (before ? ((now - before) / before) * 100 : now ? 100 : 0);

// ------------------------------------------------------------- components

function Kpi({ label, value, icon: Icon, delta, hint }: { label: string; value: string; icon: typeof Eye; delta?: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5"><Icon className="h-5 w-5 text-[#174fa2]" /></div>
      </div>
      {delta !== undefined ? (
        <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(0)}% vs previous period
        </p>
      ) : (
        hint && <p className="mt-3 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

function Card({ title, icon: Icon, action, children }: { title: string; icon?: typeof Eye; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          {Icon && <Icon className="h-4 w-4 text-[#174fa2]" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function NotConnected({ what, steps, error }: { what: string; steps: string[]; error?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
      {error ? (
        <p className="text-red-600">Connected, but the last request failed: {error}</p>
      ) : (
        <>
          <p className="font-medium text-slate-800">{what} is not connected yet.</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        </>
      )}
    </div>
  );
}

function BarList({ rows }: { rows: { key: string; label: React.ReactNode; value: number; sub?: React.ReactNode }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="text-sm text-gray-500">No data for this period yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key} className="relative overflow-hidden rounded-md">
          <div className="absolute inset-y-0 left-0 rounded-md bg-sky-100" style={{ width: `${(r.value / max) * 100}%` }} />
          <div className="relative flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="min-w-0 truncate text-gray-800">{r.label}</span>
            <span className="shrink-0 font-semibold text-gray-900">
              {nf.format(r.value)} {r.sub}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ------------------------------------------------------------------- page

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapSource, setMapSource] = useState<'site' | 'cloudflare'>('site');

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/analytics/overview?days=${days}${refresh ? '&refresh=1' : ''}`, { credentials: 'include' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Could not load analytics');
      setData(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const site = data?.site;
  const cf = data?.cloudflare;
  const gsc = data?.google.searchConsole;

  const mapData: MapDatum[] = useMemo(() => {
    if (mapSource === 'cloudflare') return (cf?.countries || []).map((c) => ({ code: c.code, value: c.requests }));
    return (site?.countries || []).map((c) => ({ code: c.code, value: c.visitors }));
  }, [mapSource, site, cf]);

  const topCountries = mapSource === 'cloudflare'
    ? (cf?.countries || []).slice(0, 10).map((c) => ({ key: c.code, label: <>{flag(c.code)} {countryName(c.code)}</>, value: c.requests }))
    : [...(site?.countries || [])].sort((a, b) => b.visitors - a.visitors).slice(0, 10).map((c) => ({ key: c.code + c.name, label: <>{flag(c.code)} {countryName(c.code, c.name)}</>, value: c.visitors }));

  const deviceTotal = (site?.devices || []).reduce((s, d) => s + d.views, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real page views on the English and Nepali site, Cloudflare traffic and Google Search.
            {data && <> Updated {new Date(data.generatedAt).toLocaleTimeString()}.</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
            {RANGES.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3.5 py-2 text-sm font-medium transition ${days === d ? 'bg-[#174fa2] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {d === 365 ? '1y' : `${d}d`}
              </button>
            ))}
          </div>
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {!data && loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-white" />)}
        </div>
      ) : site && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Page views" value={nf.format(site.totals.views)} icon={Eye} delta={change(site.totals.views, site.previous.views)} />
            <Kpi label="Visitors" value={nf.format(site.totals.visitors)} icon={Users} delta={change(site.totals.visitors, site.previous.visitors)} />
            <Kpi label="Countries" value={nf.format(site.countries.filter((c) => c.code !== 'XX').length)} icon={Globe2} hint="Where readers come from" />
            <Kpi
              label="Pages per visitor"
              value={site.totals.visitors ? (site.totals.views / site.totals.visitors).toFixed(1) : '0'}
              icon={FileText}
              hint="Higher means people keep reading"
            />
          </div>

          {/* Traffic over time */}
          <Card title="Traffic over time" icon={TrendingUp}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={site.daily} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={12} minTickGap={24} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" name="Page views" stroke="#0284c7" fill="url(#views)" strokeWidth={2} isAnimationActive={false} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#16a34a" fill="transparent" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Map + countries */}
          <Card
            title="Visitors around the world"
            icon={Globe2}
            action={
              <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-medium">
                <button onClick={() => setMapSource('site')} className={`px-3 py-1.5 ${mapSource === 'site' ? 'bg-[#174fa2] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Site visitors
                </button>
                <button
                  onClick={() => setMapSource('cloudflare')}
                  disabled={!cf?.countries}
                  className={`px-3 py-1.5 disabled:opacity-40 ${mapSource === 'cloudflare' ? 'bg-[#174fa2] text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Cloudflare requests
                </button>
              </div>
            }
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <WorldMap data={mapData} label={mapSource === 'site' ? 'visitors' : 'requests'} />
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Top countries</h3>
                <BarList rows={topCountries} />
              </div>
            </div>
          </Card>

          {/* Top pages + sources */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card title="Top 10 pages" icon={FileText}>
                {site.topPages.length ? (
                  <ol className="divide-y divide-gray-100">
                    {site.topPages.map((page, index) => {
                      const { section, title } = describePage(page.path);
                      const max = site.topPages[0].views || 1;
                      return (
                        <li key={page.path} className="flex items-center gap-4 py-3">
                          <span className="w-6 text-right text-sm font-bold text-gray-400">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700">{section}</span>
                              <a href={`/en${page.path === '/' ? '' : page.path}`} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-gray-900 hover:text-[#174fa2]">
                                {title}
                              </a>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            </div>
                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                              <div className="h-1.5 rounded-full bg-[#0284c7]" style={{ width: `${(page.views / max) * 100}%` }} />
                            </div>
                          </div>
                          <div className="w-28 shrink-0 text-right">
                            <div className="text-sm font-semibold text-gray-900">{nf.format(page.views)} views</div>
                            <div className="text-xs text-gray-500">EN {page.en} · NE {page.ne}</div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-500">No page views in this period yet.</p>
                )}
              </Card>
            </div>
            <div className="space-y-6">
              <Card title="Where visitors come from" icon={ExternalLink}>
                <BarList rows={site.referrers.map((r) => ({ key: r.source, label: r.source, value: r.views }))} />
              </Card>
              <Card title="Devices" icon={Users}>
                <BarList
                  rows={site.devices
                    .sort((a, b) => b.views - a.views)
                    .map((d) => ({ key: d.device, label: d.device, value: d.views, sub: <span className="text-xs font-normal text-gray-500">({deviceTotal ? Math.round((d.views / deviceTotal) * 100) : 0}%)</span> }))}
                />
              </Card>
            </div>
          </div>

          {/* Cloudflare + Google */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Cloudflare" icon={Cloud}>
              {cf?.connected && cf.totals ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Requests', compact.format(cf.totals.requests)],
                    ['Unique visitors', compact.format(cf.totals.uniques)],
                    ['Served from cache', `${cf.totals.requests ? Math.round((cf.totals.cachedRequests / cf.totals.requests) * 100) : 0}%`],
                    ['Bandwidth', bytes(cf.totals.bytes)],
                    ['Page views', compact.format(cf.totals.pageViews)],
                    ['Threats blocked', nf.format(cf.totals.threats)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-3">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="mt-1 text-lg font-bold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <NotConnected
                  what="Cloudflare"
                  error={cf?.error}
                  steps={[
                    'Cloudflare dashboard → My Profile → API Tokens → Create Token → "Read analytics and logs" template (Zone · Analytics · Read for wondertravelers.com).',
                    'Copy the Zone ID from the wondertravelers.com Overview page.',
                    'Add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID to /srv/app/shared/server.env and restart the API.',
                  ]}
                />
              )}
            </Card>

            <Card title="Google Search" icon={Search}>
              {gsc?.connected && gsc.totals ? (
                <>
                  <div className="mb-4 grid grid-cols-4 gap-2 text-sm">
                    {[
                      ['Clicks', compact.format(gsc.totals.clicks)],
                      ['Impressions', compact.format(gsc.totals.impressions)],
                      ['CTR', `${(gsc.totals.ctr * 100).toFixed(1)}%`],
                      ['Avg. position', gsc.totals.position.toFixed(1)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg bg-slate-50 p-3">
                        <div className="text-xs text-gray-500">{label}</div>
                        <div className="mt-1 text-lg font-bold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Top searches</h3>
                  <BarList rows={(gsc.topQueries || []).map((q) => ({ key: q.key, label: q.key, value: q.clicks, sub: <span className="text-xs font-normal text-gray-500">clicks</span> }))} />
                </>
              ) : (
                <NotConnected
                  what="Google Search Console"
                  error={gsc?.error}
                  steps={[
                    'Google Cloud console → create a service account and a JSON key; enable "Google Search Console API" (and "Google Analytics Data API" for GA4).',
                    'Search Console → Settings → Users and permissions → add the service account email (Restricted is enough).',
                    'Put the key (base64) in GOOGLE_SERVICE_ACCOUNT_JSON and GSC_SITE_URL=sc-domain:wondertravelers.com in server.env (GA4_PROPERTY_ID optional), then restart the API.',
                  ]}
                />
              )}
              {data.google.ga4.connected && data.google.ga4.totals && (
                <p className="mt-4 text-sm text-gray-600">
                  <Shield className="mr-1 inline h-4 w-4 text-[#174fa2]" />
                  GA4: {nf.format(data.google.ga4.totals.users)} users, {nf.format(data.google.ga4.totals.sessions)} sessions,{' '}
                  {Math.round(data.google.ga4.totals.avgSessionSeconds)}s average session.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
