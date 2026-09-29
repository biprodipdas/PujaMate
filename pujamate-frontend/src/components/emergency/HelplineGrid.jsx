'use client';

// src/components/emergency/HelplineGrid.jsx
// Static national/state helpline numbers (PRD 5.8 "Direct Dial Action").
// Plain tel: links — no JS needed to place the call, works offline too.

import { Phone } from 'lucide-react';

export default function HelplineGrid({ helplines }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {helplines.map((h) => (
        <a
          key={h.id}
          href={`tel:${h.phone}`}
          className="focus-ring flex flex-col items-center gap-1.5 rounded-2xl border border-vermilion/30 bg-vermilion-50 py-4 text-center transition-colors hover:bg-vermilion-100/60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vermilion text-white">
            <Phone size={18} />
          </span>
          <span className="font-subheading text-sm text-crimson">{h.label}</span>
          <span className="font-body text-xs font-semibold text-vermilion-700">{h.phone}</span>
        </a>
      ))}
    </div>
  );
}
