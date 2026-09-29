'use client';

import { Bath, BusFront, Cross, ParkingCircle, TrainFront, Armchair } from 'lucide-react';

export const FACILITY_TYPES = [
  { value: 'toilet', label: 'Toilets', icon: Bath },
  { value: 'medical', label: 'Medical', icon: Cross },
  { value: 'parking', label: 'Parking', icon: ParkingCircle },
  { value: 'metro', label: 'Metro', icon: TrainFront },
  { value: 'bus', label: 'Bus', icon: BusFront },
  { value: 'seniorSeating', label: 'Seating', icon: Armchair },
];

export default function FacilitiesOverlay({ active, onChange }) {
  function toggle(value) {
    onChange(active.includes(value) ? active.filter((v) => v !== value) : [...active, value]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FACILITY_TYPES.map(({ value, label, icon: Icon }) => {
        const selected = active.includes(value);
        return (
          <button key={value} type="button" onClick={() => toggle(value)} className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-body text-[11px] font-semibold transition ${selected ? 'border-vermilion bg-vermilion text-white shadow-sm' : 'border-app-border/15 bg-app-surface text-app-text/65 hover:border-vermilion/30 hover:text-vermilion'}`} aria-pressed={selected}>
            <Icon size={13} /> {label}
          </button>
        );
      })}
    </div>
  );
}
