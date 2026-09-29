'use client';

import { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { api } from '@/lib/api';

export default function LeaderboardPage() {
  const [rows,setRows]=useState([]); const [error,setError]=useState('');
  useEffect(()=>{api.getLeaderboard().then(d=>setRows(d.leaderboard||[])).catch(e=>setError(e.message));},[]);
  return <div className="flex flex-col gap-5 pb-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-[#5c0726] via-crimson to-vermilion p-6 text-white shadow-xl shadow-crimson/15"><div className="flex items-center gap-2 text-marigold"><Trophy size={18}/><span className="font-body text-[10px] font-bold uppercase tracking-[.18em]">Gamification</span></div><h1 className="font-heading mt-2 text-4xl">Puja Explorer</h1><p className="font-body mt-2 text-sm text-white/70">Explore more Pujas, check in, and climb the community leaderboard.</p></section>
    {error&&<p className="rounded-xl bg-vermilion/10 px-3 py-2 text-xs text-vermilion">{error}</p>}
    <section className="surface-card overflow-hidden">{rows.map((r,i)=><div key={r.id} className={`flex items-center gap-3 border-b border-app-border/10 px-4 py-4 last:border-0 ${i<3?'bg-marigold/[.04]':''}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-text/[.04]">{i===0?<Crown className="text-marigold" size={19}/>:i<3?<Medal className="text-vermilion" size={18}/>:<span className="font-body text-xs font-bold text-app-text/45">#{r.rank}</span>}</div><div className="min-w-0 flex-1"><p className="font-subheading truncate text-sm text-app-text">{r.name}</p><p className="font-body text-[10px] text-app-text/45">#{r.rank} explorer</p></div><div className="text-right"><p className="font-heading text-xl text-vermilion">{r.visitedCount}</p><p className="font-body text-[9px] uppercase tracking-wider text-app-text/40">Puja</p></div></div>)}{rows.length===0&&!error&&<p className="p-8 text-center text-sm text-app-text/45">No explorers yet.</p>}</section>
  </div>;
}
