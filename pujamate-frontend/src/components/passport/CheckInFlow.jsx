'use client';

// src/components/passport/CheckInFlow.jsx
// "I'm Here" check-in (PRD 5.4). Two-step geofence: first we ask the
// browser for GPS coordinates and list pandals within ~300m so the user
// can confirm which one they mean; the actual check-in call then makes
// the backend re-verify the precise distance (GEOFENCE_RADIUS_METERS)
// before writing the visit.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const NEARBY_SEARCH_RADIUS_KM = '0.3';

export default function CheckInFlow({ onCheckedIn }) {
  const [phase, setPhase] = useState('idle'); // idle | locating | choosing | confirming | error
  const [candidates, setCandidates] = useState([]);
  const [coords, setCoords] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  function startCheckIn() {
    if (!navigator.geolocation) {
      setPhase('error');
      setErrorMessage('Location isn\u2019t available on this device.');
      return;
    }

    setPhase('locating');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        try {
          const data = await api.searchPujas({
            lat: latitude,
            lng: longitude,
            radiusKm: NEARBY_SEARCH_RADIUS_KM,
            limit: 5,
          });
          if (!data.pujas || data.pujas.length === 0) {
            setPhase('error');
            setErrorMessage('No registered pandals found near your current location.');
            return;
          }
          setCandidates(data.pujas);
          setPhase('choosing');
        } catch (err) {
          setPhase('error');
          setErrorMessage(err.message || 'Could not look up nearby pandals.');
        }
      },
      () => {
        setPhase('error');
        setErrorMessage('Turn on location access, then try again.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function confirmCheckIn(puja) {
    setPhase('confirming');
    setErrorMessage('');
    try {
      const result = await api.checkIn(puja.id, coords.latitude, coords.longitude);
      onCheckedIn?.(result);
      setPhase('idle');
      setCandidates([]);
    } catch (err) {
      setPhase('error');
      setErrorMessage(err.message || 'Check-in failed. Move closer and try again.');
    }
  }

  return (
    <div className="rounded-2xl border border-crimson-100 bg-white p-4">
      <AnimatePresence mode="wait">
        {phase === 'choosing' ? (
          <motion.div
            key="choosing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            <p className="font-body text-xs font-medium text-crimson-600/70">
              Which pandal are you at?
            </p>
            {candidates.map((puja) => (
              <button
                key={puja.id}
                type="button"
                onClick={() => confirmCheckIn(puja)}
                className="focus-ring flex items-center justify-between rounded-xl border border-crimson-100 px-3 py-2 text-left hover:bg-crimson-50/50"
              >
                <span className="font-subheading text-sm text-crimson">{puja.name}</span>
                <span className="font-body text-xs text-crimson-600/60">
                  {Math.round(puja.distance_km * 1000)} m
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="font-body mt-1 text-xs text-crimson-600/50 underline"
            >
              Cancel
            </button>
          </motion.div>
        ) : (
          <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              onClick={startCheckIn}
              disabled={phase === 'locating' || phase === 'confirming'}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-vermilion py-3 font-body text-sm font-semibold text-white transition-opacity disabled:opacity-70"
            >
              {phase === 'locating' || phase === 'confirming' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {phase === 'locating' ? 'Finding you…' : 'Checking in…'}
                </>
              ) : (
                <>
                  <MapPin size={18} /> I&apos;m Here — Check In
                </>
              )}
            </button>
            {errorMessage && (
              <p role="alert" className="font-body mt-2 text-xs text-vermilion-700">
                {errorMessage}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
