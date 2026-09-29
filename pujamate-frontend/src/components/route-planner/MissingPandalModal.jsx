'use client';

import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { api } from '@/lib/api';
import { EXPLORE_REGIONS, classifyRegion } from '@/lib/region-utils';

export default function MissingPandalModal({ open, onClose, defaultRegion = 'KOLKATA' }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [region, setRegion] = useState(defaultRegion);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setRegion(defaultRegion);
    setMessage('');
    setName(''); setArea(''); setDescription(''); setSearch('');
    const selected = EXPLORE_REGIONS.find((item) => item.id === defaultRegion) || EXPLORE_REGIONS[0];
    setLat(selected.center[1]); setLng(selected.center[0]);
  }, [open, defaultRegion]);

  useEffect(() => {
    if (!open || !mapContainer.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    mapboxgl.accessToken = token;
    const selected = EXPLORE_REGIONS.find((item) => item.id === defaultRegion) || EXPLORE_REGIONS[0];
    const map = new mapboxgl.Map({ container: mapContainer.current, style: 'mapbox://styles/mapbox/light-v11', center: selected.center, zoom: selected.zoom });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    const marker = new mapboxgl.Marker({ color: '#E32636', draggable: true }).setLngLat(selected.center).addTo(map);
    marker.on('dragend', () => { const p = marker.getLngLat(); setCoordinates(p.lng, p.lat); });
    map.on('click', (event) => { marker.setLngLat(event.lngLat); setCoordinates(event.lngLat.lng, event.lngLat.lat); });
    mapRef.current = map; markerRef.current = marker;
    return () => { marker.remove(); map.remove(); mapRef.current = null; markerRef.current = null; };
  }, [open, defaultRegion]);

  useEffect(() => {
    if (mapRef.current && lat !== null && lng !== null && markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [lat, lng]);

  function setCoordinates(nextLng, nextLat) { setLng(nextLng); setLat(nextLat); }

  async function searchLocation(event) {
    event?.preventDefault();
    if (!search.trim()) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) { setMessage('Mapbox token is not configured. Use the map directly.'); return; }
    setSearching(true); setMessage('');
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search.trim())}.json?limit=5&country=IN&access_token=${encodeURIComponent(token)}`;
      const response = await fetch(url);
      const data = await response.json();
      const feature = data.features?.[0];
      if (!feature) throw new Error('Location not found.');
      const [nextLng, nextLat] = feature.center;
      setCoordinates(nextLng, nextLat);
      setArea(feature.place_name || search.trim());
      mapRef.current?.flyTo({ center: [nextLng, nextLat], zoom: 15, duration: 600 });
    } catch (error) { setMessage(error.message || 'Could not find that location.'); }
    finally { setSearching(false); }
  }

  function useLocation() {
    if (!navigator.geolocation) { setMessage('Location is not available on this device.'); return; }
    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates(position.coords.longitude, position.coords.latitude);
      mapRef.current?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 15, duration: 600 });
    }, () => setMessage('Location permission was not granted.'));
  }

  async function submit(event) {
    event.preventDefault();
    if (!name.trim() || !area.trim() || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      setMessage('Pandal name, locality and map pin are required.'); return;
    }
    setSubmitting(true); setMessage('');
    try {
      await api.suggestPandal({ name: name.trim(), area: area.trim(), description: description.trim(), latitude: Number(lat), longitude: Number(lng), region: classifyRegion({ latitude: lat, longitude: lng }) });
      setMessage('Pandal suggestion submitted for verification.');
      setTimeout(onClose, 900);
    } catch (error) { setMessage(error.message || 'Could not submit the suggestion.'); }
    finally { setSubmitting(false); }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Suggest a missing pandal">
      <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-marigold/60 bg-app-surface shadow-2xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-crimson to-[#65121b] px-5 py-4 text-white">
          <div><h2 className="font-subheading text-lg">Suggest a Missing Pandal</h2><p className="font-body text-[10px] text-marigold/85">Help PujaMate discover every Puja para across Bengal</p></div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="max-h-[82vh] overflow-auto p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="font-body text-[11px] font-bold text-app-text/65">Pandal / Para Name *<input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tridhara Sammilani" className="mt-1.5 w-full rounded-xl border border-app-border/15 bg-app-surface px-3 py-2.5 text-xs outline-none focus:border-vermilion" /></label>
            <label className="font-body text-[11px] font-bold text-app-text/65">Explore region<select value={region} onChange={(e) => { setRegion(e.target.value); const r = EXPLORE_REGIONS.find((item) => item.id === e.target.value); if (r) { setLng(r.center[0]); setLat(r.center[1]); mapRef.current?.flyTo({ center: r.center, zoom: r.zoom, duration: 600 }); } }} className="mt-1.5 w-full rounded-xl border border-app-border/15 bg-app-surface px-3 py-2.5 text-xs outline-none"><option value="KOLKATA">Kolkata</option><option value="HOWRAH">Howrah</option><option value="SERAMPORE">Serampore</option><option value="CHANDANNAGAR">Chandannagar</option><option value="OTHER">Other Areas</option></select></label>
          </div>
          <label className="mt-3 block font-body text-[11px] font-bold text-app-text/65">Locality / Street / Landmark *<input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Kalighat, Strand Road" className="mt-1.5 w-full rounded-xl border border-app-border/15 bg-app-surface px-3 py-2.5 text-xs outline-none focus:border-vermilion" /></label>
          <div className="mt-3 flex gap-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search area, building or landmark…" className="min-w-0 flex-1 rounded-xl border border-app-border/15 bg-app-surface px-3 py-2.5 text-xs outline-none focus:border-vermilion" /><button type="button" onClick={searchLocation} disabled={searching} className="inline-flex items-center gap-1.5 rounded-xl border border-vermilion/25 px-3 text-xs font-bold text-vermilion"><Search size={14} />{searching ? '…' : 'Search'}</button></div>
          <div className="mt-3 flex items-center justify-between"><span className="font-body text-[11px] font-bold text-app-text/65"><MapPin size={13} className="mr-1 inline text-vermilion" />Pin Location on Map</span><button type="button" onClick={useLocation} className="inline-flex items-center gap-1.5 rounded-full border border-app-border/15 px-3 py-1.5 font-body text-[10px] font-bold text-app-text/65"><LocateFixed size={12} /> Use my location</button></div>
          <div ref={mapContainer} className="mt-2 h-64 overflow-hidden rounded-2xl border border-app-border/10 bg-app-text/5" />
          <label className="mt-3 block font-body text-[11px] font-bold text-app-text/65">Short description (optional)<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Anything useful visitors should know" className="mt-1.5 w-full resize-none rounded-xl border border-app-border/15 bg-app-surface px-3 py-2.5 text-xs outline-none focus:border-vermilion" /></label>
          {message && <p className="mt-3 rounded-xl bg-vermilion/10 px-3 py-2.5 font-body text-xs text-vermilion">{message}</p>}
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-app-border/15 px-4 py-2.5 font-body text-xs font-bold text-app-text/65">Cancel</button><button type="submit" disabled={submitting} className="rounded-xl bg-vermilion px-5 py-2.5 font-body text-xs font-bold text-white disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Pandal'}</button></div>
        </form>
      </div>
    </div>
  );
}
