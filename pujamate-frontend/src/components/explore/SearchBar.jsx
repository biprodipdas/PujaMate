'use client';

import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search pandals, areas, themes…' }) {
  return (
    <div className="relative">
      <Search size={18} strokeWidth={2} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-vermilion/65" />
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="focus-ring font-body w-full rounded-2xl border border-app-border/10 bg-app-surface py-3.5 pl-11 pr-10 text-sm text-app-text shadow-sm outline-none placeholder:text-app-text/35" />
      {value && <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-app-text/40 hover:text-vermilion"><X size={15} /></button>}
    </div>
  );
}
