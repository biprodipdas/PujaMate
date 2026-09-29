'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bot, Clock3, MapPin, Sparkles, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';

export default function AIPlannerPage() {
  const [form, setForm] = useState({ timeWindowMinutes: 300, visitDurationMinutes: 45, vibe: 'BALANCED', maxStops: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [savedGroup, setSavedGroup] = useState('');
  useEffect(() => { api.listGroups().then((d) => setGroups(d.groups || [])).catch(() => {}); }, []);

  function locate() {
    if (!navigator.geolocation) return setError('Location is not available in this browser.');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      setLoading(true); setError('');
      try {
        const data = await api.generateAIPlan({ ...form, startLat: coords.latitude, startLng: coords.longitude });
        setPlan(data.plan);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    }, () => setError('Allow location access so PujaMate can build a nearby plan.'));
  }

  return <div className="flex flex-col gap-5 pb-6">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-crimson via-vermilion to-[#ff7a18] p-6 text-white shadow-xl shadow-crimson/20">
      <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-marigold/30 blur-3xl" />
      <div className="relative"><span className="inline-flex items-center gap-2 font-body text-[10px] font-bold uppercase tracking-[.18em] text-marigold"><Sparkles size={13}/> Smart planning</span><h1 className="font-heading mt-2 text-4xl leading-none">AI Puja Planner</h1><p className="font-body mt-3 max-w-md text-sm leading-6 text-white/75">Tell PujaMate your time and mood. It combines distance, ratings and recent crowd signals to build a pandal-hopping plan.</p></div>
    </section>

    <section className="surface-card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="font-body text-xs font-semibold text-app-text/70">Time available<div className="mt-2 flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-3"><Clock3 size={15}/><select value={form.timeWindowMinutes} onChange={e=>setForm({...form,timeWindowMinutes:Number(e.target.value)})} className="w-full bg-transparent text-sm text-app-text outline-none [&>option]:bg-[#1a0f0d] [&>option]:text-white"><option value={180}>3 hours</option><option value={240}>4 hours</option><option value={300}>5 hours</option><option value={360}>6 hours</option><option value={480}>8 hours</option></select></div></label>
        <label className="font-body text-xs font-semibold text-app-text/70">Visit each Puja<div className="mt-2 flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-3"><Clock3 size={15}/><select value={form.visitDurationMinutes} onChange={e=>setForm({...form,visitDurationMinutes:Number(e.target.value)})} className="w-full bg-transparent text-sm text-app-text outline-none [&>option]:bg-[#1a0f0d] [&>option]:text-white"><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option><option value={75}>75 min</option></select></div></label>
        <label className="font-body text-xs font-semibold text-app-text/70">Planning style<div className="mt-2 flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-3"><Sparkles size={15}/><select value={form.vibe} onChange={e=>setForm({...form,vibe:e.target.value})} className="w-full bg-transparent text-sm text-app-text outline-none [&>option]:bg-[#1a0f0d] [&>option]:text-white"><option value="BALANCED">Balanced</option><option value="LOW_CROWD">Avoid crowds</option><option value="TOP_RATED">Top rated</option><option value="TRADITIONAL">Traditional Puja</option><option value="THEME">Theme Puja</option></select></div></label>
        <label className="font-body text-xs font-semibold text-app-text/70">Maximum stops<div className="mt-2 flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-3"><UsersRound size={15}/><select value={form.maxStops} onChange={e=>setForm({...form,maxStops:Number(e.target.value)})} className="w-full bg-transparent text-sm text-app-text outline-none [&>option]:bg-[#1a0f0d] [&>option]:text-white"><option value={3}>3 Pujas</option><option value={4}>4 Pujas</option><option value={5}>5 Pujas</option><option value={6}>6 Pujas</option><option value={8}>8 Pujas</option></select></div></label>
      </div>
      <button onClick={locate} disabled={loading} className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-vermilion py-3 font-body text-sm font-bold text-white disabled:opacity-60"><Bot size={17}/>{loading ? 'Building your plan…' : 'Build My Puja Plan'}</button>
      {error && <p className="mt-3 rounded-xl bg-vermilion/10 px-3 py-2 text-xs text-vermilion">{error}</p>}
    </section>

    {plan && <section className="surface-card overflow-hidden">
      <div className="border-b border-app-border/10 bg-marigold/10 p-5"><p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-crimson">{plan.vibe.replace('_',' ')}</p><h2 className="font-heading mt-1 text-3xl text-app-text">{plan.title}</h2><p className="font-body mt-2 text-xs leading-5 text-app-text/55">{plan.summary}</p></div>
      <ol className="p-4">{plan.stops.map((stop, index)=><li key={stop.pujaId} className="relative flex gap-3 py-3 first:pt-1 last:pb-1"><div className="flex flex-col items-center"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-vermilion text-xs font-bold text-white">{index+1}</span>{index<plan.stops.length-1&&<span className="mt-1 h-full w-px bg-vermilion/15"/>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-subheading text-sm text-app-text">{stop.name}</h3><p className="font-body mt-1 flex items-center gap-1 text-[11px] text-app-text/45"><MapPin size={11}/>{stop.area}</p></div><span className="rounded-full bg-marigold/15 px-2 py-1 text-[10px] font-bold text-crimson">{stop.rating ? `${stop.rating.toFixed(1)} ★` : 'New'}</span></div><div className="mt-2 flex flex-wrap gap-2 font-body text-[10px] text-app-text/45"><span>{stop.transitMinutes} min travel</span><span>•</span><span>{stop.visitMinutes} min visit</span><span>•</span><span>{stop.crowdLevel} crowd</span></div></div></li>)}</ol>
    </section>}
    {plan && groups.length > 0 && <section className="surface-card p-4"><p className="font-subheading text-sm text-app-text">Share this plan with your group</p><div className="mt-3 flex gap-2"><select value={groupId} onChange={e=>setGroupId(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-app-border/10 bg-app-surface px-3 py-2 text-xs text-app-text"><option value="">Choose a group</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><button onClick={async()=>{if(!groupId)return;try{await api.updateGroup(groupId,{plan});setSavedGroup('Plan shared with your group.')}catch(e){setSavedGroup(e.message)}}} className="rounded-xl bg-vermilion px-4 text-xs font-bold text-white">Share</button></div>{savedGroup&&<p className="mt-2 text-[11px] text-emerald-600">{savedGroup}</p>}</section>}
    <Link href="/groups" className="font-body inline-flex items-center justify-center rounded-xl border border-app-border/10 py-3 text-sm font-semibold text-app-text/70">Plan this trip with friends →</Link>
  </div>;
}