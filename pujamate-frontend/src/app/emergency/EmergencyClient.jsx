'use client';

// src/app/emergency/EmergencyClient.jsx
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import HelplineGrid from '@/components/emergency/HelplineGrid';
import NearbyServiceList from '@/components/emergency/NearbyServiceList';
import { api } from '@/lib/api';

const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'POLICE', label: 'Police' },
  { value: 'HOSPITAL', label: 'Hospital' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'FIRST_AID', label: 'First Aid' },
];

export default function EmergencyClient() {
  const [helplines, setHelplines] = useState([]);
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState('');

  // Helplines are static and don't need location — load immediately
  useEffect(() => {
    api
      .getHelplines()
      .then((data) => setHelplines(data.helplines || []))
      .catch(() => setHelplines([]));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      setError('Location isn\u2019t available on this device — showing helplines only.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Turn on location access to see verified services near you.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    setLoadingServices(true);
    const params = { lat: coords.latitude, lng: coords.longitude, radiusKm: 8 };
    if (category) params.category = category;

    api
      .getNearbyEmergencyServices(params)
      .then((data) => {
        if (!cancelled) setServices(data.services || []);
      })
      .catch(() => {
        if (!cancelled) setServices([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingServices(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coords, category]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-2xl bg-crimson px-4 py-3 text-white">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-marigold" />
        <div>
          <h2 className="font-subheading text-base">Emergency Assistance</h2>
          <p className="font-body text-xs text-white/80">
            In a life-threatening emergency, call 112 or 100 immediately.
          </p>
        </div>
      </div>

      <section>
        <h3 className="font-subheading mb-2 text-sm text-crimson-600/80">Quick dial</h3>
        <HelplineGrid helplines={helplines} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-subheading text-sm text-crimson-600/80">Nearby verified services</h3>
          {locating && (
            <span className="font-body flex items-center gap-1 text-xs text-crimson-600/50">
              <Loader2 size={12} className="animate-spin" /> Locating…
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              className={`focus-ring font-body rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                category === opt.value
                  ? 'border-vermilion bg-vermilion text-white'
                  : 'border-crimson-100 bg-white text-crimson-600/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="font-body text-xs text-vermilion-700">
            {error}
          </p>
        )}

        <NearbyServiceList services={services} loading={loadingServices} />
      </section>
    </div>
  );
}
