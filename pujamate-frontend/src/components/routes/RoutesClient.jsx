'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, MapPinned, Pencil, Route, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function RoutesClient() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadRoutes() {
    setLoading(true);
    setError('');
    try {
      const data = await api.listRoutes();
      setRoutes(data.routes || []);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Sign in to view saved routes.' : err.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadRoutes(); }, []);

  async function renameRoute(route) {
    const title = window.prompt('Route name', route.title);
    if (!title || title === route.title) return;
    try {
      const data = await api.updateRoute(route.id, { title });
      setRoutes((current) => current.map((item) => (item.id === route.id ? data.route : item)));
    } catch (err) { setError(err.message); }
  }

  async function removeRoute(route) {
    if (!window.confirm(`Delete "${route.title}"?`)) return;
    try {
      await api.deleteRoute(route.id);
      setRoutes((current) => current.filter((item) => item.id !== route.id));
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <section className="rounded-[2rem] bg-gradient-to-br from-crimson to-vermilion p-6 text-white shadow-xl shadow-crimson/15">
        <span className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-marigold">Your journeys</span>
        <h2 className="font-heading mt-2 text-4xl leading-none">Saved routes.</h2>
        <p className="font-body mt-3 max-w-md text-sm text-white/70">Keep your favourite pandal-hopping plans ready for the next Puja night.</p>
      </section>

      {loading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-vermilion" /></div>}
      {error && <p role="alert" className="font-body rounded-2xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700 dark:bg-vermilion/10 dark:text-vermilion-400">{error}</p>}
      {!loading && !error && routes.length === 0 && (
        <section className="surface-card flex flex-col items-center p-8 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-marigold-50 text-crimson dark:bg-marigold/10 dark:text-marigold"><Route size={24} /></span><h3 className="font-subheading mt-4 text-base text-app-text">No saved routes yet</h3><p className="font-body mt-1 max-w-xs text-sm text-app-text/50">Build a route from your current location and save it here.</p><Link href="/route-planner" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-vermilion px-4 py-2.5 font-body text-xs font-bold text-white">Open Route Planner <ArrowRight size={14} /></Link></section>
      )}

      <div className="flex flex-col gap-3">
        {routes.map((route) => (
          <article key={route.id} className="surface-card overflow-hidden p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-vermilion/10 text-vermilion"><MapPinned size={16} /></span><div><h3 className="font-subheading truncate text-base text-app-text">{route.title}</h3><p className="font-body text-[11px] text-app-text/45">{route.stops?.length || 0} stops · {new Date(route.created_at).toLocaleDateString()}</p></div></div></div><div className="flex gap-1"><button type="button" onClick={() => renameRoute(route)} aria-label={`Rename ${route.title}`} className="focus-ring rounded-full p-2 text-app-text/45 hover:bg-app-text/5 hover:text-app-text"><Pencil size={15} /></button><button type="button" onClick={() => removeRoute(route)} aria-label={`Delete ${route.title}`} className="focus-ring rounded-full p-2 text-vermilion hover:bg-vermilion-50 dark:hover:bg-vermilion/10"><Trash2 size={15} /></button></div></div>
            <ol className="mt-4 grid gap-2">{(route.stops || []).map((stop, index) => <li key={`${route.id}-${stop.pujaId}-${index}`} className="flex items-center gap-3 rounded-xl bg-app-text/[.035] px-3 py-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vermilion text-[10px] font-bold text-white">{index + 1}</span><span className="font-body min-w-0 flex-1 truncate text-xs font-medium text-app-text/75">{stop.name}</span><span className="font-body text-[10px] text-app-text/40">{stop.area}</span></li>)}</ol>
          </article>
        ))}
      </div>
    </div>
  );
}
