'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LocateFixed, MapPinned, Navigation, Search, UtensilsCrossed } from 'lucide-react';
import { api } from '@/lib/api';

const OPTIONS = [
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'street food', label: 'Street Food' },
  { value: 'cafe', label: 'Cafés' },
  { value: 'sweet shop', label: 'Sweets' },
];

const BUDGETS = [
  { value: '₹', label: 'Budget' },
  { value: '₹₹', label: 'Mid-Range' },
  { value: '₹₹₹', label: 'Premium' },
];

// Kolkata Main Zones Coordinates
const REGIONS = {
  central: { name: 'Central Kolkata', lat: 22.5726, lng: 88.3639 },
  north: { name: 'North Kolkata (Shyambazar/Hatibagan)', lat: 22.5958, lng: 88.3697 },
  south: { name: 'South Kolkata (Gariahat/Ballygunge)', lat: 22.5186, lng: 88.3644 },
  east: { name: 'East Kolkata (Salt Lake/New Town)', lat: 22.5726, lng: 88.4331 },
  howrah: { name: 'Howrah Area', lat: 22.5958, lng: 88.2636 },
};

export default function FoodPage() {
  const [mode, setMode] = useState('explore');
  const [category, setCategory] = useState('restaurant');
  const [budget, setBudget] = useState('₹');
  const [pujas, setPujas] = useState([]);
  
  // Selection States
  const [selectedZone, setSelectedZone] = useState('central');
  const [pujaId, setPujaId] = useState('');
  
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.searchPujas({ limit: 500 }).then(data => setPujas(data.pujas || [])).catch(() => {});
  }, []);

  const selectedPuja = useMemo(() => pujas.find(p => String(p.id) === String(pujaId)) || null, [pujas, pujaId]);

  function handleAreaChange(e) {
    const val = e.target.value;
    if (val.startsWith('zone-')) {
      setSelectedZone(val.replace('zone-', ''));
      setPujaId('');
    } else {
      setPujaId(val);
    }
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setMessage('Location is not available on this device. Explore Kolkata mode is still available.');
      return;
    }
    setLocating(true);
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setMode('near-me');
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMessage('Location permission was not granted. You can continue with Explore Kolkata mode.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }

  // Exact Target Coordinates Selection
  const target = mode === 'near-me' && coords
    ? coords
    : selectedPuja
      ? { latitude: Number(selectedPuja.latitude), longitude: Number(selectedPuja.longitude) }
      : { latitude: REGIONS[selectedZone]?.lat || 22.5726, longitude: REGIONS[selectedZone]?.lng || 88.3639 };

  // Label Display Logic
  const placeLabel = mode === 'near-me' && coords
    ? 'around your current location'
    : selectedPuja
      ? `around ${selectedPuja.name}`
      : `around ${REGIONS[selectedZone]?.name || 'Central Kolkata'}`;

  const query = `${category} ${budget === '₹' ? 'budget' : budget === '₹₹' ? 'mid range' : 'premium'} food in Kolkata`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&center=${target.latitude},${target.longitude}`;

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Top Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-marigold-50 to-white p-6 dark:from-marigold/10 dark:to-app-surface">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-marigold/20 blur-2xl" />
        <span className="font-body inline-flex items-center gap-1.5 rounded-full bg-marigold px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-crimson">
          <UtensilsCrossed size={12} /> Food Finder
        </span>
        <h2 className="font-heading mt-4 text-4xl leading-none text-app-text">
          Refuel between<br /><span className="text-vermilion">pandals.</span>
        </h2>
        <p className="font-body mt-3 max-w-md text-sm leading-6 text-app-text/60">
          Choose a pandal or zone. You can discover Kolkata food without sharing your current location.
        </p>
      </section>

      {/* Mode & Dropdown Selection */}
      <section className="surface-card p-4 sm:p-5">
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('explore')}
            className={`flex-1 rounded-2xl px-3 py-2.5 font-body text-xs font-bold transition-all ${
              mode === 'explore' ? 'bg-crimson text-white' : 'bg-app-text/5 text-app-text/60'
            }`}
          >
            🗺️ Explore Kolkata
          </button>
          <button
            type="button"
            onClick={useLocation}
            className={`flex-1 rounded-2xl px-3 py-2.5 font-body text-xs font-bold transition-all ${
              mode === 'near-me' ? 'bg-crimson text-white' : 'bg-app-text/5 text-app-text/60'
            }`}
            disabled={locating}
          >
            {locating ? 'Locating…' : '📍 Near Me'}
          </button>
        </div>

        {mode === 'explore' ? (
          <label className="block">
            <span className="font-body mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-app-text/50">
              Choose a Zone or Puja Pandal
            </span>
            <select
              value={pujaId || `zone-${selectedZone}`}
              onChange={handleAreaChange}
              className="w-full rounded-2xl border border-app-border/10 bg-app-surface px-4 py-3 font-body text-sm text-app-text outline-none focus:border-vermilion/40"
            >
              <optgroup label="Main Kolkata Zones">
                <option value="zone-central">Central Kolkata / All nearby food</option>
                <option value="zone-north">North Kolkata (Shyambazar / Hatibagan)</option>
                <option value="zone-south">South Kolkata (Gariahat / Ballygunge)</option>
                <option value="zone-east">East Kolkata (Salt Lake / New Town)</option>
                <option value="zone-howrah">Howrah Region</option>
              </optgroup>

              {pujas.length > 0 && (
                <optgroup label="Specific Puja Pandals">
                  {pujas.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.area}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
        ) : (
          <div className="glass-card flex items-center gap-3 p-3">
            <LocateFixed size={17} className="text-vermilion" />
            <p className="font-body text-xs text-app-text/60">Food search will open around your current coordinates.</p>
          </div>
        )}
      </section>

      {/* Craving Category & Budget Filters */}
      <section className="surface-card p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-subheading text-base text-app-text">What are you craving?</h3>
          <span className="font-body text-[10px] uppercase tracking-widest text-app-text/40">Budget</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`focus-ring rounded-2xl border px-3 py-3 text-left font-body text-xs font-semibold transition-all ${
                category === option.value
                  ? 'border-vermilion bg-vermilion text-white'
                  : 'border-app-border/10 bg-app-text/[.03] text-app-text/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {BUDGETS.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => setBudget(item.value)}
              className={`focus-ring rounded-2xl border py-2.5 font-body text-xs font-bold transition-all ${
                budget === item.value
                  ? 'border-marigold bg-marigold text-crimson shadow-md'
                  : 'border-app-border/10 bg-app-text/[.03] text-app-text/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Search Target Card */}
      <section className="glass-card flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vermilion text-white">
          <MapPinned size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-subheading text-sm text-app-text">Search target</h3>
          <p className="font-body text-xs text-app-text/50 truncate">{placeLabel}</p>
        </div>
        <span className="font-body rounded-full bg-app-text/5 px-2.5 py-1 text-[10px] font-bold text-app-text/50">
          GPS {mode === 'near-me' ? 'ON' : 'OFF'}
        </span>
      </section>

      {message && <p role="alert" className="font-body rounded-2xl bg-vermilion/10 px-3 py-2 text-xs text-vermilion">{message}</p>}

      {/* Final Action Button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="focus-ring flex items-center justify-between rounded-2xl bg-vermilion px-4 py-4 text-white shadow-lg shadow-vermilion/20 hover:bg-crimson transition-all"
      >
        <span>
          <span className="font-subheading block text-sm">Find food on Maps</span>
          <span className="font-body text-xs text-white/70">
            {category} · {BUDGETS.find(b => b.value === budget)?.label} · {placeLabel}
          </span>
        </span>
        <Navigation size={20} />
      </a>

      <div className="glass-card flex gap-3 p-4">
        <Search size={17} className="mt-0.5 shrink-0 text-vermilion" />
        <p className="font-body text-xs leading-5 text-app-text/60">
          Food results are opened from a live map search. The selected zone or pandal coordinates are used as the search center.
        </p>
      </div>

      <Link href="/route-planner" className="font-body text-center text-xs font-semibold text-vermilion">
        Planning a long night? Build your route first →
      </Link>
    </div>
  );
}