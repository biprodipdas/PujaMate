'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, MapPinned, Navigation, TrainFront } from 'lucide-react';
import { api } from '@/lib/api';
import { METRO_LINES, distanceKm } from '@/lib/metro-data';

const RADIUS_OPTIONS = [0.5, 1, 2];
const CROWD_OPTIONS = ['ALL', 'LOW', 'MODERATE', 'HEAVY'];

function crowdColor(level) {
  if (level === 'HEAVY') return 'text-vermilion';
  if (level === 'MODERATE') return 'text-marigold';
  if (level === 'LOW') return 'text-emerald-600';
  return 'text-app-text/50';
}

export default function MetroPujaRoutePage() {
  const [pujas, setPujas] = useState([]);
  const [activeLine, setActiveLine] = useState('blue');
  const [radius, setRadius] = useState(1);
  const [crowd, setCrowd] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.searchPujas({ limit: 500 })
      .then(data => setPujas(data.pujas || []))
      .catch(() => setPujas([]))
      .finally(() => setLoading(false));
  }, []);

  const line = METRO_LINES.find(item => item.id === activeLine) || METRO_LINES[0];

  const stationData = useMemo(() => line.stations.map(([name, lat, lng], index) => {
    let nearby = pujas.map(puja => ({
      ...puja,
      distanceKm: distanceKm(lat, lng, Number(puja.latitude), Number(puja.longitude)),
    })).filter(puja => puja.distanceKm <= radius);
    if (crowd !== 'ALL') nearby = nearby.filter(p => p.currentCrowdLevel === crowd || p.current_crowd_level === crowd || p.crowd_level === crowd);
    nearby.sort((a,b) => a.distanceKm - b.distanceKm);
    return { id: `${line.id}-${index}`, name, lat, lng, nearby };
  }), [line, pujas, radius, crowd]);

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-crimson-950 to-crimson p-5 text-white shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-body inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.16em]"><TrainFront size={13}/> Metro Puja Route</span>
            <h1 className="font-heading mt-3 text-4xl leading-none sm:text-5xl">Metro → Pandal</h1>
            <p className="font-body mt-3 max-w-xl text-sm leading-6 text-white/70">মেট্রো লাইন ধরে ভ্রমণ করুন আর প্রতিটি স্টেশনের কাছের সেরা পুজো প্যান্ডেলগুলি দেখে নিন।</p>
          </div>
          <span className="hidden rounded-2xl bg-marigold/15 p-3 text-marigold sm:block"><MapPinned size={24}/></span>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {METRO_LINES.map(item => <button key={item.id} type="button" onClick={() => setActiveLine(item.id)} className={`focus-ring shrink-0 rounded-2xl border px-4 py-2.5 font-body text-xs font-bold ${activeLine === item.id ? 'border-vermilion bg-vermilion text-white shadow-md' : 'border-app-border/10 bg-app-surface text-app-text/65'}`}>{item.emoji} {item.name}</button>)}
      </div>

      <section className="surface-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="font-body mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-app-text/50">Nearby radius</label>
            <div className="flex gap-2">{RADIUS_OPTIONS.map(value => <button key={value} type="button" onClick={() => setRadius(value)} className={`rounded-xl px-3 py-2 font-body text-xs font-bold ${radius === value ? 'bg-crimson text-white' : 'bg-app-text/5 text-app-text/60'}`}>{value < 1 ? `${value*1000} m` : `${value} km`}</button>)}</div>
          </div>
          <div>
            <label className="font-body mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-app-text/50">Crowd</label>
            <div className="flex flex-wrap gap-2">{CROWD_OPTIONS.map(value => <button key={value} type="button" onClick={() => setCrowd(value)} className={`rounded-xl px-3 py-2 font-body text-xs font-bold ${crowd === value ? 'bg-crimson text-white' : 'bg-app-text/5 text-app-text/60'}`}>{value === 'ALL' ? 'All' : value[0] + value.slice(1).toLowerCase()}</button>)}</div>
          </div>
        </div>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="border-b border-app-border/10 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">Complete route</p><h2 className="font-subheading mt-1 text-xl text-app-text">{line.emoji} {line.name}</h2></div><span className="font-body rounded-full bg-app-text/5 px-3 py-1 text-[11px] font-bold text-app-text/55">{stationData.length} stations</span></div>
        </div>
        {loading ? <div className="p-5 text-sm text-app-text/55">Loading metro route…</div> : <div className="p-4 sm:p-5">{stationData.map((station, index) => {
          const open = expanded[station.id] ?? station.nearby.length > 0;
          return <div key={station.id} className="relative pl-8">
            {index < stationData.length - 1 && <span className="absolute left-[11px] top-7 bottom-0 w-px bg-app-border/15"/>}
            <span className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-vermilion bg-app-surface text-[9px] font-bold text-vermilion">{index + 1}</span>
            <div className="pb-4">
              <button type="button" onClick={() => setExpanded(prev => ({...prev, [station.id]: !open}))} className="focus-ring flex w-full items-center justify-between gap-3 rounded-2xl bg-app-text/[.035] px-3.5 py-3 text-left">
                <span><span className="font-subheading block text-sm text-app-text">🚉 {station.name}</span><span className="font-body mt-0.5 block text-[11px] text-app-text/50">{station.nearby.length ? `${station.nearby.length} nearby pandal${station.nearby.length > 1 ? 's' : ''}` : 'No nearby pandal in selected radius'}</span></span>
                <ChevronDown size={16} className={`shrink-0 text-app-text/40 transition-transform ${open ? 'rotate-180' : ''}`}/>
              </button>
              {open && station.nearby.length > 0 && <div className="mt-2 space-y-2">{station.nearby.slice(0, 8).map(puja => <Link key={puja.id} href={`/explore?puja=${puja.id}`} className="group flex items-center gap-3 rounded-2xl border border-app-border/10 bg-app-surface px-3 py-2.5 hover:border-vermilion/25">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marigold-50 text-sm dark:bg-marigold/10">⭐</span>
                <span className="min-w-0 flex-1"><span className="font-subheading block truncate text-xs text-app-text">{puja.name}</span><span className="font-body block text-[10px] text-app-text/50">📍 {puja.distanceKm.toFixed(1)} km · {puja.area || 'Kolkata'}</span></span>
                <span className={`font-body text-[10px] font-bold ${crowdColor(puja.currentCrowdLevel || puja.current_crowd_level || puja.crowd_level)}`}>{puja.currentCrowdLevel || puja.current_crowd_level || puja.crowd_level || 'No recent report'}</span><ArrowRight size={14} className="text-app-text/25 group-hover:text-vermilion"/>
              </Link>)}</div>}
              {open && station.nearby.length === 0 && <p className="font-body px-3 py-2 text-[11px] text-app-text/40">Station stays on the route — no pandal matches this filter.</p>}
            </div>
          </div>;
        })}</div>}
      </section>

      <div className="glass-card flex items-center gap-3 p-4"><Navigation size={18} className="text-vermilion"/><p className="font-body text-xs leading-5 text-app-text/60">Distance is calculated from the station coordinates to each registered pandal. The full route remains visible even when a station has no matching pandal.</p></div>
    </div>
  );
}
