'use client';

import { useEffect, useState } from 'react';
import { Check, MapPin, Plus, X } from 'lucide-react';
import SearchBar from '@/components/explore/SearchBar';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { api } from '@/lib/api';
import { loadPandalImages } from '@/lib/pandal-images';

function PandalSearch({ label, value, onChange, placeholder }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  useEffect(() => {
    let cancelled = false;
    if (!debouncedSearch.trim()) {
      setResults([]);
      return undefined;
    }
    setLoading(true);
    api.searchPujas({ search: debouncedSearch.trim(), limit: 10 })
      .then((data) => { if (!cancelled) setResults(data.pujas || []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  return (
    <div className="relative">
      <label className="font-body mb-1.5 block text-[11px] font-bold text-app-text/55">{label}</label>
      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-vermilion/30 bg-vermilion/5 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate font-body text-xs font-bold text-app-text">{value.name}</p>
            <p className="truncate font-body text-[10px] text-app-text/45">{value.area}</p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="rounded-full p-1.5 text-app-text/45 hover:bg-app-text/5" aria-label={`Clear ${label}`}><X size={14} /></button>
        </div>
      ) : (
        <>
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={placeholder} />
          {loading && <p className="mt-1 font-body text-[10px] text-app-text/40">Searching…</p>}
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-auto rounded-xl border border-app-border/10 bg-app-surface shadow-xl">
              {results.map((puja) => <button key={puja.id} type="button" onClick={() => { onChange(puja); setSearchTerm(''); setResults([]); }} className="flex w-full items-center gap-2 border-b border-app-border/5 px-3 py-2.5 text-left last:border-0 hover:bg-app-text/[.035]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-vermilion/10 text-vermilion"><MapPin size={13} /></span>
                <span className="min-w-0"><span className="block truncate font-body text-xs font-bold text-app-text">{puja.name}</span><span className="block truncate font-body text-[10px] text-app-text/45">{puja.area}</span></span>
              </button>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StopRow({ puja, index, onRemove }) {
  const [image, setImage] = useState('/images/durga-ma.jpg');
  useEffect(() => {
    let alive = true;
    loadPandalImages(puja.name).then((images) => { if (alive && images?.[0]?.url) setImage(images[0].url); }).catch(() => {});
    return () => { alive = false; };
  }, [puja.name]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-app-border/10 bg-app-surface px-2.5 py-2 shadow-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vermilion font-body text-[10px] font-bold text-white">{index + 1}</span>
      <img src={image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" onError={(event) => { event.currentTarget.src = '/images/durga-ma.jpg'; }} />
      <div className="min-w-0 flex-1"><p className="truncate font-subheading text-xs text-app-text">{puja.name}</p><p className="truncate font-body text-[10px] text-app-text/45">{puja.area}</p></div>
      <button type="button" onClick={onRemove} className="rounded-full p-1.5 text-vermilion hover:bg-vermilion/10" aria-label={`Remove ${puja.name}`}><X size={14} /></button>
    </div>
  );
}

export default function PandalPicker({ start, onStartChange, stops, onStopsChange, end, onEndChange }) {
  function addStop(puja) {
    if (!puja || stops.some((item) => item.id === puja.id)) return;
    onStopsChange([...stops, puja]);
  }

  return (
    <section className="surface-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h3 className="font-subheading text-sm text-app-text">Route Stops</h3><p className="font-body mt-0.5 text-[10px] text-app-text/45">Pick a start, add pandals in any order, then optionally choose an end.</p></div>
        <span className="rounded-full bg-vermilion/10 px-2.5 py-1 font-body text-[10px] font-bold text-vermilion">{stops.length} stops</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <PandalSearch label="Start point" value={start} onChange={onStartChange} placeholder="Search a starting pandal…" />
        <PandalSearch label="End / destination (optional)" value={end} onChange={onEndChange} placeholder="Search an ending pandal…" />
      </div>
      <div className="mt-4"><PandalSearch label="Add a pandal stop" value={null} onChange={addStop} placeholder="Search pandal to add…" /></div>
      {stops.length > 0 && <div className="mt-3 flex flex-col gap-2">{stops.map((puja, index) => <StopRow key={puja.id} puja={puja} index={index} onRemove={() => onStopsChange(stops.filter((item) => item.id !== puja.id))} />)}</div>}
      {stops.length === 0 && <div className="mt-3 rounded-xl border border-dashed border-app-border/15 bg-app-text/[.02] px-3 py-3 text-center"><Plus size={15} className="mx-auto text-vermilion" /><p className="mt-1 font-body text-[10px] text-app-text/45">No stops yet. Search above or click a map marker to add one.</p></div>}
    </section>
  );
}
