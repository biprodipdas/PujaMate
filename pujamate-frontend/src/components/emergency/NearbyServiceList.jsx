'use client';

// src/components/emergency/NearbyServiceList.jsx
import { Phone, ShieldCheck, MapPin } from 'lucide-react';

const CATEGORY_LABEL = {
  POLICE: 'Police',
  HOSPITAL: 'Hospital',
  PHARMACY: 'Pharmacy',
  FIRST_AID: 'First Aid',
};

export default function NearbyServiceList({ services, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-crimson-100/40" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <p className="font-body py-6 text-center text-sm text-crimson-600/60">
        No verified emergency services registered near you yet — use the national helplines above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {services.map((service) => (
        <li
          key={service.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-crimson-100 bg-white p-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-subheading truncate text-sm text-crimson">{service.name}</h4>
              {service.verified && (
                <span title="Verified location">
                  <ShieldCheck size={14} className="shrink-0 text-emerald-600" />
                </span>
              )}
            </div>
            <p className="font-body flex items-center gap-1 text-xs text-crimson-600/60">
              {CATEGORY_LABEL[service.category] || service.category}
              {typeof service.distance_km === 'number' && (
                <>
                  {' · '}
                  <MapPin size={11} /> {service.distance_km.toFixed(1)} km
                </>
              )}
            </p>
          </div>

          <a
            href={`tel:${service.phone}`}
            className="focus-ring flex shrink-0 items-center gap-1.5 rounded-full bg-vermilion px-3 py-2 font-body text-xs font-semibold text-white"
          >
            <Phone size={13} /> Call
          </a>
        </li>
      ))}
    </ul>
  );
}
