'use client';

import { useEffect, useMemo, useState } from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import countries from 'i18n-iso-countries';

export interface MapDatum {
  code: string; // ISO 3166-1 alpha-2, e.g. "NP"
  value: number;
}

type CountryFeature = Feature<Geometry, { name: string }>;

const WIDTH = 960;
const HEIGHT = 470;

// Light -> dark blue, like Cloudflare's traffic map.
const SHADES = ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985'];

/** World map shaded by `value` per country, with a hover readout. */
export default function WorldMap({ data, label }: { data: MapDatum[]; label: string }) {
  const [shapes, setShapes] = useState<CountryFeature[]>([]);
  const [hover, setHover] = useState<{ name: string; value: number } | null>(null);

  useEffect(() => {
    // ~100 KB outline, loaded only when the analytics page opens.
    import('world-atlas/countries-110m.json').then((mod) => {
      const topology = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
      const collection = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>;
      setShapes(collection.features.filter((f) => f.properties.name !== 'Antarctica'));
    });
  }, []);

  const valueByNumeric = useMemo(() => {
    const map = new Map<string, { value: number; code: string }>();
    for (const d of data) {
      const numeric = countries.alpha2ToNumeric(d.code);
      if (numeric) map.set(String(Number(numeric)), { value: d.value, code: d.code });
    }
    return map;
  }, [data]);

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);
  const path = useMemo(() => geoPath(geoEqualEarth().fitSize([WIDTH, HEIGHT], { type: 'Sphere' })), []);

  const shade = (value: number) => {
    if (!value) return '#f1f5f9';
    // Square-root scale: one big country does not wash out the rest, and
    // similar countries still get different shades.
    const t = Math.sqrt(value / max);
    return SHADES[Math.min(SHADES.length - 1, Math.floor(t * SHADES.length))];
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label={`World map of ${label}`}>
        {shapes.map((shape, i) => {
          const entry = valueByNumeric.get(String(Number(shape.id)));
          const value = entry?.value || 0;
          return (
            <path
              key={`${shape.id ?? i}`}
              d={path(shape) || ''}
              fill={shade(value)}
              stroke="#ffffff"
              strokeWidth={0.5}
              className="transition-opacity hover:opacity-80 cursor-pointer"
              onMouseEnter={() => setHover({ name: shape.properties.name, value })}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      {shapes.length === 0 && <div className="absolute inset-0 animate-pulse rounded-lg bg-slate-100" />}
      <div className="absolute left-3 bottom-3 flex items-center gap-2 text-xs text-slate-500">
        <span>0</span>
        <span className="flex h-2 w-32 overflow-hidden rounded">
          {SHADES.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </span>
        <span>{max.toLocaleString()}</span>
      </div>
      {hover && (
        <div className="absolute right-3 top-3 rounded-lg bg-slate-900/90 px-3 py-2 text-sm text-white shadow">
          <div className="font-semibold">{hover.name}</div>
          <div>
            {hover.value.toLocaleString()} {label}
          </div>
        </div>
      )}
    </div>
  );
}
