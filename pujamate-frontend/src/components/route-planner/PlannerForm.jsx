'use client';

// src/components/route-planner/PlannerForm.jsx
import { MapPin, Loader2 } from 'lucide-react';

const TIME_WINDOW_OPTIONS = [
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
  { value: 360, label: '6 hours' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: '100', label: '₹100 / person' },
  { value: '200', label: '₹200 / person' },
  { value: '500', label: '₹500+ / person' },
];

export default function PlannerForm({ form, onChange, onLocate, locating }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-crimson-100 bg-white p-4">
      <div>
        <p className="font-body mb-1.5 text-xs font-medium text-crimson-600/70">Starting point</p>
        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-crimson-100 py-2.5 font-body text-sm text-crimson transition-colors hover:bg-crimson-50/50 disabled:opacity-60"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
          {form.startLat
            ? `Using current location (${form.startLat.toFixed(3)}, ${form.startLng.toFixed(3)})`
            : locating
              ? 'Finding you…'
              : 'Use my current location'}
        </button>
      </div>

      <div>
        <p className="font-body mb-1.5 text-xs font-medium text-crimson-600/70">Time window</p>
        <div className="flex flex-wrap gap-2">
          {TIME_WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...form, timeWindowMinutes: opt.value })}
              className={`focus-ring font-body rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                form.timeWindowMinutes === opt.value
                  ? 'border-vermilion bg-vermilion text-white'
                  : 'border-crimson-100 bg-white text-crimson-600/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body mb-1.5 text-xs font-medium text-crimson-600/70">Walking preference</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'LESS_WALKING', label: 'Less Walking' },
            { value: 'HIGH_MOBILITY', label: 'High Mobility' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...form, walkingPreference: opt.value })}
              className={`focus-ring font-body rounded-xl border py-2 text-sm font-medium transition-colors ${
                form.walkingPreference === opt.value
                  ? 'border-vermilion bg-vermilion text-white'
                  : 'border-crimson-100 bg-white text-crimson-600/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-body mb-1.5 text-xs font-medium text-crimson-600/70">Food budget</p>
        <select
          className="focus-ring font-body w-full rounded-xl border border-crimson-100 bg-white px-3 py-2 text-sm text-crimson"
          value={form.budget}
          onChange={(event) => onChange({ ...form, budget: event.target.value })}
        >
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
