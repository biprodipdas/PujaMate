'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Bookmark, Car, CheckCircle2, ChevronDown, CircleDot, Footprints, LocateFixed, MapPinned, Navigation, Plus, RefreshCw, Route, Search, Sparkles, TrainFront, X } from 'lucide-react';
import MapView from '@/components/map/MapViewLoader';
import FacilitiesOverlay from '@/components/map/FacilitiesOverlay';
import PlannerForm from '@/components/route-planner/PlannerForm';
import PandalPicker from '@/components/route-planner/PandalPicker';
import MissingPandalModal from '@/components/route-planner/MissingPandalModalLoader';
import { useBookmarksStore } from '@/store/useBookmarksStore';
import { api } from '@/lib/api';
import { EXPLORE_REGIONS, filterByRegion, getExploreRegion } from '@/lib/region-utils';
import { loadPandalImages } from '@/lib/pandal-images';

const INITIAL_FORM = { timeWindowMinutes: 240, walkingPreference: 'HIGH_MOBILITY', budget: '', travelMode: 'WALKING', smartOrder: true, roundTrip: false };
const TRAVEL_MODES = [
  { value: 'WALKING', label: 'Walk', icon: Footprints },
  { value: 'DRIVING', label: 'Drive', icon: Car },
  { value: 'CYCLING', label: 'Cycle', icon: Navigation },
  { value: 'TRANSIT', label: 'Transit', icon: TrainFront },
];

function distanceKm(a, b) {
  const R = 6371; const dLat = (Number(b.latitude) - Number(a.latitude)) * Math.PI / 180; const dLng = (Number(b.longitude) - Number(a.longitude)) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(Number(a.latitude) * Math.PI / 180) * Math.cos(Number(b.latitude) * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function MapPandalCard({ puja, onSetStart, onAddStop, onClose }) {
  const [image, setImage] = useState('/images/durga-ma.jpg');
  useEffect(() => { let alive = true; if (puja?.name) loadPandalImages(puja.name).then((images) => { if (alive && images?.[0]?.url) setImage(images[0].url); }).catch(() => {}); return () => { alive = false; }; }, [puja?.name]);
  if (!puja) return null;
  return <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md overflow-hidden rounded-2xl border border-app-border/10 bg-app-surface/95 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-5 sm:w-[390px]">
    <div className="flex gap-3 p-3"><img src={image} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" onError={(e) => { e.currentTarget.src = '/images/durga-ma.jpg'; }} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="truncate font-subheading text-sm text-app-text">{puja.name}</h3><p className="font-body text-[10px] text-app-text/45">{puja.area}</p></div><button type="button" onClick={onClose} className="rounded-full p-1 text-app-text/45 hover:bg-app-text/5"><X size={14} /></button></div><p className="mt-1 font-body text-[10px] text-app-text/55">⭐ {puja.rating || puja.avg_rating || '—'} · {puja.pujo_type || 'Puja'}</p></div></div>
    <div className="grid grid-cols-3 gap-1.5 border-t border-app-border/10 p-2"><button type="button" onClick={() => onSetStart(puja)} className="rounded-xl bg-emerald-600 py-2 font-body text-[10px] font-bold text-white">⚑ Start</button><button type="button" onClick={() => onAddStop(puja)} className="rounded-xl bg-vermilion py-2 font-body text-[10px] font-bold text-white">⚑ Add Stop</button><a href={`/explore?puja=${encodeURIComponent(puja.id)}`} className="rounded-xl bg-marigold py-2 text-center font-body text-[10px] font-bold text-[#5d4300]">Explore Details →</a></div>
  </div>;
}

export default function RoutePlannerClient() {
  const bookmarks = useBookmarksStore((state) => state.bookmarks);
  const [regionId, setRegionId] = useState('KOLKATA');
  const [allPujas, setAllPujas] = useState([]);
  const [loadingPujas, setLoadingPujas] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [start, setStart] = useState(null);
  const [gpsStart, setGpsStart] = useState(null);
  const [stops, setStops] = useState([]);
  const [end, setEnd] = useState(null);
  const [locating, setLocating] = useState(false);
  const [activeFacilityTypes, setActiveFacilityTypes] = useState([]);
  const [facilityMarkers, setFacilityMarkers] = useState([]);
  const [selectedMapPuja, setSelectedMapPuja] = useState(null);
  const [mapSearch, setMapSearch] = useState('');
  const [focusPuja, setFocusPuja] = useState(null);
  const [staticPoi, setStaticPoi] = useState(null);
  const [plan, setPlan] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const region = getExploreRegion(regionId);
  const regionPujas = useMemo(() => filterByRegion(allPujas, regionId), [allPujas, regionId]);
  const mapStart = start ? { latitude: Number(start.latitude), longitude: Number(start.longitude), name: start.name } : gpsStart;
  const mapSearchResults = useMemo(() => {
    const term = mapSearch.trim().toLowerCase();
    if (!term) return [];
    return regionPujas.filter((p) => `${p.name} ${p.area}`.toLowerCase().includes(term)).slice(0, 6);
  }, [mapSearch, regionPujas]);
  const routeEnd = plan?.roundTrip ? mapStart : (end ? { latitude: Number(end.latitude), longitude: Number(end.longitude), name: end.name } : null);

  useEffect(() => {
    let cancelled = false;
    setLoadingPujas(true); setError('');
    api.searchPujas({ limit: 500, offset: 0 }).then((data) => { if (!cancelled) setAllPujas(data.pujas || []); }).catch((err) => { if (!cancelled) setError(err.message || 'Unable to load pandals.'); }).finally(() => { if (!cancelled) setLoadingPujas(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setPlan(null); setRouteGeometry(null); setSelectedMapPuja(null); setStaticPoi(null); setFocusPuja(null); setMapSearch('');
  }, [regionId]);

  useEffect(() => {
    if (!activeFacilityTypes.length) { setFacilityMarkers([]); return undefined; }
    let cancelled = false;
    const apiFacilityTypes = activeFacilityTypes.filter((type) => type !== 'bus');
    if (!apiFacilityTypes.length) { setFacilityMarkers([]); return undefined; }
    const params = { types: apiFacilityTypes.join(',') };
    api.getFacilities(params).then((data) => { if (!cancelled) setFacilityMarkers(data.pujas || []); }).catch(() => { if (!cancelled) setFacilityMarkers([]); });
    return () => { cancelled = true; };
  }, [activeFacilityTypes]);

  function locate() {
    if (!navigator.geolocation) { setError('Location is not available on this device.'); return; }
    setLocating(true); setError('');
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude, name: 'My current location' };
      setGpsStart(next); setStart(null); setLocating(false); setMessage('Current location set as route start.');
    }, () => { setLocating(false); setError('Location permission was not granted. You can still select a pandal or Explore region without GPS.'); }, { enableHighAccuracy: true, timeout: 10000 });
  }

  function addStop(puja) {
    if (!puja || stops.some((item) => item.id === puja.id)) return;
    setStops((current) => [...current, puja]); setSelectedMapPuja(null); setMessage(`${puja.name} added to your route.`);
  }

  function setRouteStart(puja) { setStart(puja); setGpsStart(null); setPlan(null); setRouteGeometry(null); }

  function useBookmarks() {
    const filtered = bookmarks.filter((b) => regionId === 'OTHER' || filterByRegion([b], regionId).length > 0);
    setStops(filtered); setMessage(`${filtered.length} saved pandal${filtered.length === 1 ? '' : 's'} added to the route.`);
  }

  function autoStopsFromRegion() {
    if (!mapStart) return [];
    return [...regionPujas].sort((a, b) => distanceKm(mapStart, a) - distanceKm(mapStart, b)).slice(0, 8);
  }

  async function fetchRoadGeometry(routePlan) {
    const coords = [];
    if (mapStart) coords.push([Number(mapStart.longitude), Number(mapStart.latitude)]);
    (routePlan.stops || []).forEach((s) => coords.push([Number(s.longitude), Number(s.latitude)]));
    if (routeEnd) coords.push([Number(routeEnd.longitude), Number(routeEnd.latitude)]);
    if (form.roundTrip && mapStart) coords.push([Number(mapStart.longitude), Number(mapStart.latitude)]);
    if (coords.length < 2) return null;
    const profile = form.travelMode === 'DRIVING' ? 'driving' : form.travelMode === 'CYCLING' ? 'cycling' : 'walking';
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return null;
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords.map((c) => c.join(',')).join(';')}?geometries=geojson&overview=full&steps=false&access_token=${encodeURIComponent(token)}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      return data.routes?.[0]?.geometry || null;
    } catch (_) { return null; }
  }

  async function handleGenerate() {
    setError(''); setMessage(''); setSelectedMapPuja(null);
    if (!mapStart) { setError('Choose a Start point or use your current location first.'); return; }
    setGenerating(true);
    try {
      const chosen = stops.length ? stops : autoStopsFromRegion();
      if (!chosen.length) throw new Error(`No verified pandals are currently mapped in ${region.label}. Use Suggest Missing Pandal to add one for verification.`);
      const payload = {
        startLat: Number(mapStart.latitude), startLng: Number(mapStart.longitude),
        startName: mapStart.name || 'Start', startPujaId: start?.id || null,
        endLat: end ? Number(end.latitude) : null, endLng: end ? Number(end.longitude) : null, endName: end?.name || null,
        timeWindowMinutes: form.timeWindowMinutes, walkingPreference: form.walkingPreference, budget: form.budget || null,
        pujaIds: chosen.map((p) => p.id), stopIds: chosen.map((p) => p.id), travelMode: form.travelMode, smartOrder: form.smartOrder, roundTrip: form.roundTrip,
      };
      const result = await api.generateRoute(payload);
      setPlan(result);
      const geometry = await fetchRoadGeometry(result);
      setRouteGeometry(geometry);
      setMessage(`${result.stops?.length || 0} stop${result.stops?.length === 1 ? '' : 's'} added. Route generated.`);
    } catch (err) { setError(err.message || 'Could not generate the route.'); }
    finally { setGenerating(false); }
  }

  async function saveRoute() {
    if (!plan?.stops?.length) return;
    try { await api.saveRoute(`PujaMate Route — ${new Date().toLocaleDateString()}`, plan.stops); setMessage('Route saved to your profile.'); } catch (err) { setError(err.message === 'Failed to fetch' ? 'Sign in to save routes.' : err.message); }
  }

  function resetRoute() { setPlan(null); setRouteGeometry(null); setStops([]); setStart(null); setEnd(null); setGpsStart(null); setMessage('Route cleared.'); }

  return (
    <div className="route-planner-shell -mt-5 min-h-[calc(100vh-7rem)] bg-[#fffaf0] sm:-mt-6">
      <div className="border-b border-[#7b1424]/10 bg-app-surface/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-body text-[10px] font-bold uppercase tracking-[.2em] text-vermilion">PujaMate 2026</p><h1 className="font-heading text-2xl text-app-text sm:text-3xl">Pandal Map & Route Planner</h1></div><button type="button" onClick={() => setMissingOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-vermilion px-4 py-2.5 font-body text-[11px] font-bold text-white shadow-lg shadow-vermilion/15"><Plus size={14} /> Suggest Missing Pandal</button></div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative"><MapPinned size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-vermilion" /><select value={regionId} onChange={(e) => setRegionId(e.target.value)} className="appearance-none rounded-full border border-app-border/15 bg-app-surface py-2 pl-9 pr-8 font-body text-[11px] font-bold text-app-text outline-none"><option value="KOLKATA">Kolkata</option><option value="HOWRAH">Howrah</option><option value="SERAMPORE">Serampore</option><option value="CHANDANNAGAR">Chandannagar</option><option value="OTHER">Other Areas</option></select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-app-text/45" /></div>
            <button type="button" onClick={locate} disabled={locating} className="inline-flex items-center gap-1.5 rounded-full border border-app-border/15 bg-app-surface px-3 py-2 font-body text-[11px] font-bold text-app-text/70"><LocateFixed size={13} className={locating ? 'animate-pulse text-vermilion' : 'text-vermilion'} /> {locating ? 'Locating…' : 'Near Me'}</button>
            <span className="rounded-full bg-app-text/[.045] px-3 py-2 font-body text-[10px] text-app-text/50">{loadingPujas ? 'Loading pandals…' : `${regionPujas.length} mapped in ${region.label}`}</span>
            {bookmarks.length > 0 && <button type="button" onClick={useBookmarks} className="inline-flex items-center gap-1.5 rounded-full border border-marigold/40 bg-marigold/10 px-3 py-2 font-body text-[11px] font-bold text-[#785500]"><Bookmark size={13} /> Saved ({bookmarks.length})</button>}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-3 p-3 lg:grid-cols-[370px_minmax(0,1fr)] lg:p-4">
        <aside className="order-2 flex min-h-0 flex-col gap-3 lg:order-1">
          <section className="rounded-2xl border border-[#7b1424]/10 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-subheading text-sm text-app-text">Route Planner</h2><button type="button" onClick={resetRoute} className="font-body text-[10px] font-bold text-app-text/45 hover:text-vermilion">Clear</button></div>
            <div className="grid grid-cols-4 gap-1.5">{TRAVEL_MODES.map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => setForm((f) => ({ ...f, travelMode: value }))} className={`rounded-xl border py-2 font-body text-[10px] font-bold ${form.travelMode === value ? 'border-vermilion bg-vermilion text-white' : 'border-app-border/10 bg-app-surface text-app-text/55'}`}><Icon size={14} className="mx-auto mb-1" />{label}</button>)}</div>
          </section>

          <PandalPicker start={start} onStartChange={setRouteStart} stops={stops} onStopsChange={setStops} end={end} onEndChange={setEnd} />

          <div className="rounded-2xl border border-[#7b1424]/10 bg-white p-3"><div className="flex items-center gap-2"><button type="button" onClick={() => setForm((f) => ({ ...f, smartOrder: !f.smartOrder }))} className={`flex h-6 w-11 items-center rounded-full p-1 ${form.smartOrder ? 'bg-vermilion' : 'bg-app-text/15'}`}><span className={`h-4 w-4 rounded-full bg-white transition ${form.smartOrder ? 'translate-x-5' : ''}`} /></button><div><p className="font-body text-xs font-bold text-app-text">Smart order</p><p className="font-body text-[10px] text-app-text/45">Reduce backtracking between selected stops</p></div><Sparkles size={15} className="ml-auto text-marigold" /></div><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => setForm((f) => ({ ...f, roundTrip: !f.roundTrip }))} className={`flex h-6 w-11 items-center rounded-full p-1 ${form.roundTrip ? 'bg-vermilion' : 'bg-app-text/15'}`}><span className={`h-4 w-4 rounded-full bg-white transition ${form.roundTrip ? 'translate-x-5' : ''}`} /></button><div><p className="font-body text-xs font-bold text-app-text">Round trip</p><p className="font-body text-[10px] text-app-text/45">Return to the starting point after the last stop</p></div><ArrowDownUp size={15} className="ml-auto text-vermilion" /></div></div>

          <FacilitiesOverlay active={activeFacilityTypes} onChange={setActiveFacilityTypes} />
          <PlannerForm form={form} onChange={setForm} onLocate={locate} locating={locating} />

          <button type="button" onClick={handleGenerate} disabled={generating || loadingPujas} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-vermilion py-3.5 font-body text-sm font-bold text-white shadow-lg shadow-vermilion/15 disabled:opacity-60"><Route size={16} />{generating ? 'Generating route…' : 'Generate Route'}</button>
          {plan && <button type="button" onClick={saveRoute} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-vermilion/20 bg-white py-3 font-body text-xs font-bold text-vermilion"><Bookmark size={15} /> Save Route</button>}
          {message && <p className="rounded-xl bg-emerald-50 px-3 py-2 font-body text-[10px] text-emerald-700">{message}</p>}
          {error && <p className="rounded-xl bg-vermilion/10 px-3 py-2.5 font-body text-[11px] text-vermilion">{error}</p>}

          {plan?.stops?.length > 0 && <section className="rounded-2xl border border-[#7b1424]/10 bg-white p-3"><div className="mb-2 flex items-center justify-between"><h3 className="font-subheading text-sm text-app-text">Your Route</h3><span className="font-body text-[10px] text-app-text/45">{plan.totalMinutes} min estimate</span></div><ol className="flex flex-col gap-2">{plan.stops.map((stop, index) => <li key={`${stop.pujaId}-${index}`} className="flex items-center gap-2 rounded-xl bg-app-text/[.035] p-2.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vermilion font-body text-[10px] font-bold text-white">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate font-subheading text-xs text-app-text">{stop.name}</p><p className="font-body text-[10px] text-app-text/45">{stop.area} · {stop.distanceFromPreviousKm} km · {stop.transitMinutes} min</p></div><CheckCircle2 size={14} className="text-emerald-600" /></li>)}</ol>{plan.unableToFit?.length > 0 && <p className="mt-2 font-body text-[10px] text-app-text/45">Not included in this time window: {plan.unableToFit.map((p) => p.name).join(', ')}</p>}</section>}
        </aside>

        <section className="order-1 min-w-0 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl border border-[#7b1424]/10 bg-[#eef2f4] shadow-sm">
            <div className="absolute left-3 right-3 top-3 z-20 flex flex-wrap items-center gap-2"><div className="flex min-w-[220px] flex-1 items-center rounded-xl border border-black/5 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur"><Search size={14} className="mr-2 text-app-text/35" /><input value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} placeholder="Search pandals or area…" className="min-w-0 flex-1 bg-transparent font-body text-xs outline-none" /><span className="rounded-full bg-vermilion/10 px-2 py-1 font-body text-[9px] font-bold text-vermilion">{region.label}</span></div>{mapSearchResults.length > 0 && <div className="absolute left-0 top-[48px] z-30 w-full max-w-xl overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl">{mapSearchResults.map((puja) => <button key={puja.id} type="button" onClick={() => { setSelectedMapPuja(puja); setFocusPuja(puja); setMapSearch(''); }} className="flex w-full items-center gap-2 border-b border-app-border/5 px-3 py-2.5 text-left last:border-0 hover:bg-app-text/[.03]"><MapPinned size={13} className="text-vermilion" /><span className="min-w-0"><span className="block truncate font-body text-xs font-bold text-app-text">{puja.name}</span><span className="block truncate font-body text-[10px] text-app-text/45">{puja.area}</span></span></button>)}</div>}<span className="rounded-full border border-black/5 bg-white/95 px-3 py-2 font-body text-[10px] font-bold text-app-text/60 shadow-lg">All {regionPujas.length}</span><span className="rounded-full border border-black/5 bg-white/95 px-3 py-2 font-body text-[10px] font-bold text-app-text/60 shadow-lg">Featured</span><span className="rounded-full border border-black/5 bg-white/95 px-3 py-2 font-body text-[10px] font-bold text-app-text/60 shadow-lg">Heritage</span></div>
            <MapView pujas={regionPujas} routeStops={plan?.stops || null} routeStart={mapStart} routeEnd={routeEnd} routeGeometry={routeGeometry} facilityMarkers={facilityMarkers} activeFacilityTypes={activeFacilityTypes} userLocation={gpsStart} regionCenter={region.center} regionZoom={region.zoom} focusPuja={focusPuja} onMarkerClick={(puja) => setSelectedMapPuja(puja)} onStaticPoiClick={(poi) => setStaticPoi(poi)} className="h-[min(72vh,700px)] min-h-[560px] w-full" />
            {selectedMapPuja && <MapPandalCard puja={selectedMapPuja} onSetStart={setRouteStart} onAddStop={addStop} onClose={() => setSelectedMapPuja(null)} />}
            {staticPoi && <div className="absolute bottom-4 left-4 z-20 rounded-2xl border border-app-border/10 bg-white/95 p-3 shadow-xl backdrop-blur sm:left-1/2 sm:-translate-x-1/2"><div className="flex items-center gap-2"><span className="text-lg">{staticPoi.icon}</span><div><p className="font-subheading text-xs text-app-text">{staticPoi.name}</p><p className="font-body text-[10px] text-app-text/45">{staticPoi.line}</p></div><button type="button" onClick={() => setStaticPoi(null)} className="ml-2 rounded-full p-1 text-app-text/40"><X size={13} /></button></div></div>}
            {!loadingPujas && regionPujas.length === 0 && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/45 p-5 backdrop-blur-[1px]"><div className="max-w-sm rounded-2xl border border-app-border/10 bg-white p-5 text-center shadow-xl"><MapPinned size={24} className="mx-auto text-vermilion" /><h3 className="mt-2 font-subheading text-base text-app-text">No verified pandal pins here yet</h3><p className="mt-1 font-body text-xs leading-5 text-app-text/50">Explore mode is ready for this area. Use Suggest Missing Pandal to submit a real 2026 Puja location for verification.</p><button type="button" onClick={() => setMissingOpen(true)} className="mt-3 rounded-xl bg-vermilion px-4 py-2.5 font-body text-xs font-bold text-white">Suggest a Pandal</button></div></div>}
          </div>
        </section>
      </div>
      <MissingPandalModal open={missingOpen} onClose={() => setMissingOpen(false)} defaultRegion={regionId} />
    </div>
  );
}
