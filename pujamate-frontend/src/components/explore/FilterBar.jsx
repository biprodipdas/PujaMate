'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

const REGION_OPTIONS = [
  { value: 'KOLKATA', label: 'Kolkata' },
  { value: 'HOWRAH', label: 'Howrah' },
  { value: 'SERAMPORE', label: 'Serampore' },
  { value: 'CHANDANNAGAR', label: 'Chandannagar' },
  { value: 'OTHER', label: 'Other Areas' },
];
const AREA_OPTIONS = [
  { value: '', label: 'All areas' },
  { value: 'North Kolkata', label: 'North Kolkata' },
  { value: 'South Kolkata', label: 'South Kolkata' },
  { value: 'Central Kolkata', label: 'Central Kolkata' },
  { value: 'Salt Lake', label: 'Salt Lake' },
  { value: 'New Town', label: 'New Town' },
];
const TYPE_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'THEME', label: 'Theme Puja' },
  { value: 'TRADITIONAL', label: 'Traditional' },
  { value: 'BIG_BUDGET', label: 'Big Budget' },
  { value: 'AWARD_WINNING', label: 'Award Winning' },
  { value: 'FAMILY_FRIENDLY', label: 'Family-Friendly' },
];
const DISTANCE_OPTIONS = [
  { value: '', label: 'Any distance' },
  { value: '1', label: 'Within 1 km' },
  { value: '3', label: 'Within 3 km' },
  { value: '5', label: 'Within 5 km' },
];
const selectClasses = 'focus-ring font-body rounded-xl border border-app-border/10 bg-app-surface px-3 py-2.5 text-xs font-medium text-app-text shadow-sm outline-none';

export default function FilterBar({ filters, onChange }) {
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  function handleDistanceChange(radiusKm) {
    if (!radiusKm) { onChange({ ...filters, radiusKm: '', lat: '', lng: '' }); return; }
    if (filters.lat && filters.lng) { onChange({ ...filters, radiusKm }); return; }
    if (!navigator.geolocation) { setLocationError('Location isn’t available on this device.'); return; }
    setLocating(true); setLocationError('');
    navigator.geolocation.getCurrentPosition((position) => { setLocating(false); onChange({ ...filters, radiusKm, lat: position.coords.latitude, lng: position.coords.longitude }); }, () => { setLocating(false); setLocationError('Turn on location access to filter by distance.'); }, { enableHighAccuracy: true, timeout: 8000 });
  }
  return <div className="surface-card flex flex-col gap-3 p-3"><div className="flex flex-wrap gap-2">
    <select className={selectClasses} value={filters.region} onChange={(e) => onChange({ ...filters, region: e.target.value, area: '' })} aria-label="Explore region">{REGION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
    <select className={selectClasses} value={filters.area} onChange={(e) => onChange({ ...filters, area: e.target.value })} aria-label="Filter by area">{AREA_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
    <select className={selectClasses} value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })} aria-label="Filter by category">{TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
    <select className={selectClasses} value={filters.radiusKm} onChange={(e) => handleDistanceChange(e.target.value)} aria-label="Filter by distance">{DISTANCE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
    {locating && <span className="font-body inline-flex items-center gap-1 text-xs text-app-text/50"><MapPin size={13} className="animate-pulse" /> Locating…</span>}
  </div>{locationError && <p role="alert" className="font-body text-xs text-vermilion">{locationError}</p>}</div>;
}
