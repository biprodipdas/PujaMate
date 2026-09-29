'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BusFront, ChevronDown, MapPinned, Navigation } from 'lucide-react';
import { api } from '@/lib/api';
import { BUS_ROUTES, distanceKm } from '@/lib/bus-data';

const RADIUS_OPTIONS=[0.5,1,2];
const CROWD_OPTIONS=['ALL','LOW','MODERATE','HEAVY'];

function crowdColor(level){if(level==='HEAVY')return'text-vermilion';if(level==='MODERATE')return'text-marigold';if(level==='LOW')return'text-emerald-600';return'text-app-text/50';}

export default function BusPujaRoutePage(){
  const [pujas,setPujas]=useState([]),[active,setActive]=useState('12c'),[radius,setRadius]=useState(1),[crowd,setCrowd]=useState('ALL'),[loading,setLoading]=useState(true),[expanded,setExpanded]=useState({});
  useEffect(()=>{api.searchPujas({limit:500}).then(d=>setPujas(d.pujas||[])).catch(()=>setPujas([])).finally(()=>setLoading(false));},[]);
  const route=BUS_ROUTES.find(r=>r.id===active)||BUS_ROUTES[0];
  const stopData=useMemo(()=>route.stops.map(([name,lat,lng],index)=>{
    let nearby=pujas.map(p=>({...p,distanceKm:distanceKm(lat,lng,Number(p.latitude),Number(p.longitude))})).filter(p=>p.distanceKm<=radius);
    if(crowd!=='ALL')nearby=nearby.filter(p=>p.current_crowd_level===crowd||p.currentCrowdLevel===crowd||p.crowd_level===crowd);
    nearby.sort((a,b)=>a.distanceKm-b.distanceKm);
    return{id:`${route.id}-${index}`,name,lat,lng,nearby};
  }),[route,pujas,radius,crowd]);

  return <div className="flex flex-col gap-5 pb-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-crimson-950 to-vermilion p-5 text-white shadow-xl sm:p-7">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[.16em]"><BusFront size={13}/> Bus Puja Route</span>
      <h1 className="font-heading mt-3 text-4xl leading-none sm:text-5xl">Bus → Pandal</h1>
      <p className="font-body mt-3 max-w-xl text-sm leading-6 text-white/70">আপনার পছন্দের বাস রুটটি বেছে নিন এবং স্টপ অনুযায়ী পথের সেরা প্যান্ডেলগুলি দেখে নিন।</p>
    </section>
    <div className="flex gap-2 overflow-x-auto pb-1">{BUS_ROUTES.map(r=><button key={r.id} type="button" onClick={()=>setActive(r.id)} className={`shrink-0 rounded-2xl border px-4 py-2.5 font-body text-xs font-bold ${active===r.id?'border-vermilion bg-vermilion text-white shadow-md':'border-app-border/10 bg-app-surface text-app-text/65'}`}>🚌 {r.name}</button>)}</div>
    <section className="surface-card p-4"><div className="grid gap-3 sm:grid-cols-2">
      <div><label className="mb-2 block font-body text-[10px] font-bold uppercase tracking-[.16em] text-app-text/50">Nearby radius</label><div className="flex gap-2">{RADIUS_OPTIONS.map(v=><button key={v} type="button" onClick={()=>setRadius(v)} className={`rounded-xl px-3 py-2 font-body text-xs font-bold ${radius===v?'bg-crimson text-white':'bg-app-text/5 text-app-text/60'}`}>{v<1?`${v*1000} m`:`${v} km`}</button>)}</div></div>
      <div><label className="mb-2 block font-body text-[10px] font-bold uppercase tracking-[.16em] text-app-text/50">Crowd</label><div className="flex flex-wrap gap-2">{CROWD_OPTIONS.map(v=><button key={v} type="button" onClick={()=>setCrowd(v)} className={`rounded-xl px-3 py-2 font-body text-xs font-bold ${crowd===v?'bg-crimson text-white':'bg-app-text/5 text-app-text/60'}`}>{v==='ALL'?'All':v[0]+v.slice(1).toLowerCase()}</button>)}</div></div>
    </div></section>
    <section className="surface-card overflow-hidden">
      <div className="border-b border-app-border/10 px-4 py-4 sm:px-5"><div className="flex items-center justify-between gap-3"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">Complete route</p><h2 className="font-subheading mt-1 text-xl">🚌 {route.name} · {route.from} → {route.to}</h2></div><span className="rounded-full bg-app-text/5 px-3 py-1 font-body text-[11px] font-bold text-app-text/55">{stopData.length} stops</span></div></div>
      {loading?<div className="p-5 font-body text-sm text-app-text/55">Loading bus route…</div>:<div className="p-4 sm:p-5">{stopData.map((stop,index)=>{const open=expanded[stop.id]??stop.nearby.length>0;return <div key={stop.id} className="relative pl-8">
        {index<stopData.length-1&&<span className="absolute left-[11px] top-7 bottom-0 w-px bg-app-border/15"/>}<span className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-vermilion bg-app-surface text-[9px] font-bold text-vermilion">{index+1}</span>
        <div className="pb-4"><button type="button" onClick={()=>setExpanded(prev=>({...prev,[stop.id]:!open}))} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-app-text/[.035] px-3.5 py-3 text-left"><span><span className="font-subheading block text-sm">🚌 {stop.name}</span><span className="mt-0.5 block font-body text-[11px] text-app-text/50">{stop.nearby.length?`${stop.nearby.length} nearby pandal${stop.nearby.length>1?'s':''}`:'No nearby pandal in selected radius'}</span></span><ChevronDown size={16} className={`text-app-text/40 transition-transform ${open?'rotate-180':''}`}/></button>
        {open&&stop.nearby.length>0&&<div className="mt-2 space-y-2">{stop.nearby.slice(0,8).map(p=><Link key={p.id} href={`/explore?puja=${p.id}`} className="group flex items-center gap-3 rounded-2xl border border-app-border/10 bg-app-surface px-3 py-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-marigold-50 text-sm dark:bg-marigold/10">⭐</span><span className="min-w-0 flex-1"><span className="block truncate font-subheading text-xs">{p.name}</span><span className="block font-body text-[10px] text-app-text/50">📍 {p.distanceKm.toFixed(1)} km · {p.area||'Kolkata'}</span></span><span className={`font-body text-[10px] font-bold ${crowdColor(p.current_crowd_level||p.currentCrowdLevel||p.crowd_level)}`}>{p.current_crowd_level||p.currentCrowdLevel||p.crowd_level||'—'}</span><ArrowRight size={14} className="text-app-text/25 group-hover:text-vermilion"/></Link>)}</div>}
        {open&&stop.nearby.length===0&&<p className="px-3 py-2 font-body text-[11px] text-app-text/40">Stop stays on the route — no pandal matches this filter.</p>}</div>
      </div>})}</div>}
    </section>
    <div className="glass-card flex items-center gap-3 p-4"><span className="shrink-0 rounded-full bg-app-text/5 px-2 py-1 font-body text-[9px] font-bold text-app-text/50">WBTC route reference</span><Navigation size={18} className="text-vermilion"/><p className="font-body text-xs leading-5 text-app-text/60">Bus stop coordinates are used for nearby matching; your device location is not used on this route page.</p></div>
  </div>;
}
