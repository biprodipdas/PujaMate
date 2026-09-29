'use client';

// src/components/crowd/CrowdReportButton.jsx
// The "I'm Here" crowd reporting control (PRD 5.2). Submits a single
// tap report and lets the backend's time-decay algorithm do the rest —
// this component only needs to fire the POST and reflect success/error.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { api } from '@/lib/api';

const LEVELS = [
  { value: 'LOW', label: 'Low', className: 'border-emerald-500 text-emerald-700 hover:bg-emerald-50' },
  { value: 'MODERATE', label: 'Moderate', className: 'border-marigold text-marigold-600 hover:bg-marigold-50' },
  { value: 'HEAVY', label: 'Heavy', className: 'border-vermilion text-vermilion-700 hover:bg-vermilion-50' },
];

export default function CrowdReportButton({ pujaId, onReported }) {
  const [submitting, setSubmitting] = useState(null); // level currently in-flight
  const [justReported, setJustReported] = useState(null);
  const [error, setError] = useState('');

  async function handleReport(level) {
    setSubmitting(level);
    setError('');
    try {
      await api.submitCrowdReport(pujaId, level);
      setJustReported(level);
      onReported?.(level);
      setTimeout(() => setJustReported(null), 2500);
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Sign in to report crowd levels.' : err.message);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-xs font-medium text-crimson-600/70">
        What&apos;s it like right now?
      </p>
      <div className="flex gap-2">
        {LEVELS.map(({ value, label, className }) => (
          <button
            key={value}
            type="button"
            disabled={submitting !== null}
            onClick={() => handleReport(value)}
            className={`focus-ring font-body flex-1 rounded-xl border bg-white py-2 text-sm font-medium transition-colors disabled:opacity-60 ${className}`}
          >
            {justReported === value ? (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center justify-center gap-1"
              >
                <Check size={15} /> Thanks!
              </motion.span>
            ) : (
              label
            )}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="font-body text-xs text-vermilion-700">
          {error}
        </p>
      )}
    </div>
  );
}
