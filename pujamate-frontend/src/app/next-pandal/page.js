'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Crosshair, MapPin, Navigation, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export default function NextPandalPage() {
  const user = useAuthStore((state) => state.user);
  
  const [puja, setPuja] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');

    const loadWithoutGps = () => {
      api.getNextPuja()
        .then(d => {
          setPuja(d.puja);
          setOrigin(d.origin || 'last_visited_pandal');
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    };

    if (!navigator.geolocation) {
      loadWithoutGps();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        if (distanceFromKolkata(pos.coords.latitude, pos.coords.longitude) > 80) {
          loadWithoutGps();
          return;
        }
        api.getNextPuja(pos.coords.latitude, pos.coords.longitude)
          .then(d => {
            setPuja(d.puja);
            setOrigin(d.origin || 'current_location');
          })
          .catch(() => loadWithoutGps())
          .finally(() => setLoading(false));
      },
      () => loadWithoutGps(),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, [user]);


  if (!user) {
    return (
      <div className="surface-card p-6">
        <h1 className="font-heading text-3xl">🎯 Next Pandal</h1>
        <p className="mt-2 font-body text-sm text-app-text/60">
          Login to use your visited list and get a personalised next-pandal suggestion.
        </p>
        <Link href="/auth" className="mt-4 inline-flex rounded-2xl bg-crimson px-4 py-3 font-body text-xs font-bold text-white">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-crimson via-vermilion to-marigold p-5 text-white shadow-xl sm:p-7">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[.16em]">
          <Crosshair size={13}/> Personal Puja
        </span>
        <h1 className="font-heading mt-3 text-4xl">Next Pandal</h1>
        <p className="mt-3 max-w-xl font-body text-sm leading-6 text-white/80">
          একটা pandal check-in করার পর তোমার visited history থেকে পরের unvisited pandal সাজেস্ট হবে। Location ON থাকলে current location থেকে nearest option বেছে নেওয়া হবে; permission না দিলেও last visited pandal থেকে suggestion পাওয়া যাবে।
        </p>
      </section>

      {loading && <div className="surface-card p-6 font-body text-sm text-app-text/55">Finding your next pandal…</div>}
      
      {error && (
        <div className="surface-card p-5">
          <p className="font-body text-sm text-vermilion">{error}</p>
          <p className="mt-2 font-body text-xs leading-5 text-app-text/50">
            প্রথমে একটি pandal-এ গিয়ে Passport থেকে check-in করো। তারপর Next Pandal তোমার journey অনুযায়ী কাজ করবে।
          </p>
          <Link href="/passport" className="mt-4 inline-flex rounded-2xl bg-crimson px-4 py-3 font-body text-xs font-bold text-white">
            Open Puja Passport
          </Link>
        </div>
      )}

      {puja && (
        <section className="surface-card overflow-hidden">
          <div className="bg-app-text/[.03] p-6">
            <p className="font-body text-[10px] font-bold uppercase tracking-[.16em] text-vermilion">Try next</p>
            <h2 className="font-heading mt-2 text-4xl">{puja.name}</h2>
            <p className="mt-2 flex items-center gap-1 font-body text-sm text-app-text/55">
              <MapPin size={14}/>{puja.area} · {Number(puja.distance_km).toFixed(1)} km from {origin === 'current_location' ? 'you' : 'your last visit'}
            </p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-app-text/[.035] p-3">
              <p className="font-body text-[10px] text-app-text/45">Crowd</p>
              <p className="mt-1 font-subheading text-sm">{puja.current_crowd_level || 'No recent report'}</p>
            </div>
            <div className="rounded-2xl bg-app-text/[.035] p-3">
              <p className="font-body text-[10px] text-app-text/45">Rating</p>
              <p className="mt-1 flex items-center gap-1 font-subheading text-sm">
                <Star size={13} className="text-marigold"/>{puja.avg_rating || '—'}
              </p>
            </div>
            <div className="rounded-2xl bg-app-text/[.035] p-3">
              <p className="font-body text-[10px] text-app-text/45">Status</p>
              <p className="mt-1 font-subheading text-sm">Not visited</p>
            </div>
          </div>
          <div className="flex gap-2 p-4 pt-0">
            <Link href={`/explore?puja=${puja.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-crimson px-4 py-3 font-body text-xs font-bold text-white">
              View Pandal <ArrowRight size={14}/>
            </Link>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${puja.latitude},${puja.longitude}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-app-border/10 px-4 py-3 font-body text-xs font-bold">
              <Navigation size={14}/> Navigate
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

function distanceFromKolkata(lat, lng) {
  const R = 6371;
  const centerLat = 22.5726;
  const centerLng = 88.3639;
  const dLat = (Number(lat) - centerLat) * Math.PI / 180;
  const dLng = (Number(lng) - centerLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(centerLat * Math.PI / 180) * Math.cos(Number(lat) * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}