'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight, Compass, MapPinned, Route, Sparkles, Ticket, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import PandalCard from '@/components/explore/PandalCard';
import { api } from '@/lib/api';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

export default function HomePage() {
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.searchPujas({ limit: 6 })
      .then((data) => setPujas(data.pujas || []))
      .catch((err) => setError(err.message || 'Could not load pandals right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-crimson via-crimson-700 to-vermilion p-6 text-white shadow-xl shadow-crimson/15 sm:p-8">
        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-marigold/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-vermilion/30 blur-2xl" />
        <div className="relative grid items-center gap-6 sm:grid-cols-[1fr_150px]">
          <div>
            <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-marigold"><Sparkles size={12} /> Kolkata Puja Guide</span>
            <h2 className="font-heading mt-4 text-4xl leading-[.95] sm:text-5xl">Plan your<br /><span className="text-marigold">Puja nights.</span></h2>
            <p className="font-body mt-4 max-w-md text-sm leading-6 text-white/78">Find pandals, read live crowd signals, build your route, collect check-ins, and discover what you need on the way.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/explore" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-marigold px-4 py-2.5 font-body text-sm font-bold text-white shadow-lg shadow-black/10">Explore pandals <ArrowRight size={15} /></Link>
              <Link href="/route-planner" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-body text-sm font-semibold text-white">Plan route</Link>
            </div>
          </div>
          <div className="relative mx-auto hidden h-36 w-36 sm:block">
            <div className="absolute inset-0 rounded-full bg-marigold/15 blur-xl" />
            <Image src="/images/durga-ma.jpg" alt="Durga Puja" fill sizes="144px" className="relative rounded-full border-4 border-marigold/40 object-cover shadow-2xl" priority />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { href: '/explore', label: 'Discover', icon: Compass, note: 'Pandal map' },
          { href: '/route-planner', label: 'Route', icon: Route, note: 'Hop smarter' },
          { href: '/passport', label: 'Passport', icon: Ticket, note: 'Earn badges' },
          { href: '/food', label: 'Food', icon: UtensilsCrossed, note: 'Find nearby' },
          { href: '/ai-planner', label: 'AI Planner', icon: Sparkles, note: 'Plan smarter' },
          { href: '/leaderboard', label: 'Leaderboard', icon: Ticket, note: 'Puja Explorer' },
          { href: '/metro', label: 'Metro Route', icon: Route, note: 'Station → Pandal' },
          { href: '/bus', label: 'Bus Route', icon: Route, note: 'Stop → Pandal' },
          { href: '/blog', label: 'Puja Blog', icon: Sparkles, note: 'Share experiences' },
          { href: '/next-pandal', label: 'Next Pandal', icon: MapPinned, note: 'Try somewhere new' },
          { href: '/community', label: 'Puja Moments', icon: Sparkles, note: 'Share photos' },
        ].map(({ href, label, icon: Icon, note }) => (
          <Link key={href} href={href} className="focus-ring surface-card group p-3.5 hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-marigold-50 text-crimson dark:bg-marigold/10 dark:text-marigold"><Icon size={18} /></span>
            <span className="font-subheading mt-3 block text-sm text-app-text">{label}</span>
            <span className="font-body mt-0.5 block text-[11px] text-app-text/50">{note}</span>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <span className="font-body text-[10px] font-bold uppercase tracking-[.18em] text-vermilion">Live picks</span>
            <h2 className="font-subheading mt-1 text-xl text-app-text">2026 Puja picks</h2>
            <p className="font-body text-xs text-app-text/55">Browse the curated 2026 Kolkata pandal listing. Location is optional.</p>
          </div>
          <Link href="/explore" className="font-body flex items-center gap-1 text-xs font-semibold text-vermilion">See all <ArrowRight size={13} /></Link>
        </div>

        {error && <p role="alert" className="font-body rounded-2xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700 dark:bg-vermilion/10 dark:text-vermilion-400">{error}</p>}
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-3xl bg-app-text/5" />)}</div>
        ) : (
          <motion.div className="grid gap-3 sm:grid-cols-2" variants={staggerContainer} initial="initial" animate="animate">
            {pujas.map((puja) => <motion.div key={puja.id} variants={staggerItem}><PandalCard puja={puja} /></motion.div>)}
          </motion.div>
        )}
      </section>

      <section className="glass-card flex items-center gap-4 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-vermilion text-white"><MapPinned size={20} /></div>
        <div className="min-w-0 flex-1"><h3 className="font-subheading text-sm text-app-text">Going out tonight?</h3><p className="font-body mt-0.5 text-xs text-app-text/55">Location is optional. Explore Kolkata Metro, Bus, pandals and routes without GPS.</p></div>
        <Link href="/explore" className="font-body shrink-0 rounded-xl bg-app-text px-3 py-2 text-xs font-semibold text-app-bg">Explore</Link>
      </section>
    </div>
  );
}
