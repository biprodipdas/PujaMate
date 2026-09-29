'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, UsersRound } from 'lucide-react';
import { api } from '@/lib/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() { try { const data = await api.listGroups(); setGroups(data.groups || []); } catch (e) { setMessage(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function create() { if (!name.trim()) return; try { const data = await api.createGroup(name.trim()); setGroups(g=>[data.group,...g]); setName(''); setSelected(data.group); setMessage('Group created.'); } catch(e){setMessage(e.message)} }
  async function openGroup(group) { try { const data=await api.getGroup(group.id); setSelected({...data.group,members:data.members}); } catch(e){setMessage(e.message)} }
  async function addMember() { if(!selected||!email.trim()) return; try { await api.addGroupMember(selected.id,email.trim()); const data=await api.getGroup(selected.id); setSelected({...data.group,members:data.members}); setEmail(''); setMessage('Friend added to the group.'); } catch(e){setMessage(e.message)} }

  return <div className="flex flex-col gap-5 pb-6">
    <section className="rounded-[2rem] bg-gradient-to-br from-crimson to-vermilion p-6 text-white shadow-xl shadow-crimson/15"><span className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-marigold">Together is better</span><h1 className="font-heading mt-2 text-4xl">Friend Groups</h1><p className="font-body mt-3 text-sm leading-6 text-white/70">Create a shared Puja plan and invite your friends using their PujaMate email.</p></section>
    <section className="surface-card p-4"><div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Group name — College Puja Trip" className="focus-ring min-w-0 flex-1 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-3 text-sm text-app-text outline-none"/><button onClick={create} className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vermilion text-white"><Plus size={18}/></button></div></section>
    {message && <p className="rounded-xl bg-marigold/10 px-3 py-2 text-xs text-app-text/65">{message}</p>}
    {loading ? <div className="surface-card h-24 animate-pulse"/> : groups.length===0 ? <section className="surface-card p-8 text-center"><UsersRound className="mx-auto text-vermilion"/><p className="font-subheading mt-3 text-sm text-app-text">No groups yet</p></section> : <div className="grid gap-3">{groups.map(g=><button key={g.id} onClick={()=>openGroup(g)} className="surface-card focus-ring p-4 text-left"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-vermilion/10 text-vermilion"><UsersRound size={19}/></span><div className="min-w-0 flex-1"><h2 className="font-subheading text-sm text-app-text">{g.name}</h2><p className="font-body mt-1 text-[11px] text-app-text/45">{g.member_count || 0} members</p></div></div></button>)}</div>}
    {selected && <section className="surface-card p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-heading text-2xl text-app-text">{selected.name}</h2><p className="font-body text-xs text-app-text/45">Shared planning group</p></div><button onClick={()=>setSelected(null)} className="text-xs text-app-text/45">Close</button></div><div className="mt-5"><h3 className="font-subheading text-sm text-app-text">Members</h3><div className="mt-2 grid gap-2">{(selected.members||[]).map(m=><div key={m.id} className="flex items-center gap-3 rounded-xl bg-app-text/[.035] px-3 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-marigold/30 text-xs font-bold text-crimson">{m.name?.[0]}</span><div className="min-w-0"><p className="font-body text-xs font-semibold text-app-text">{m.name}</p><p className="font-body truncate text-[10px] text-app-text/40">{m.email}</p></div><Check size={14} className="ml-auto text-emerald-600"/></div>)}</div></div><div className="mt-5 flex gap-2"><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Friend's PujaMate email" className="focus-ring min-w-0 flex-1 rounded-xl border border-app-border/10 bg-app-text/[.025] px-3 py-2.5 text-xs text-app-text outline-none"/><button onClick={addMember} className="rounded-xl bg-vermilion px-4 text-xs font-bold text-white">Add</button></div></section>}
  </div>;
}
