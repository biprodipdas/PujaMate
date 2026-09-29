'use client';

import { motion } from 'framer-motion';

const LEVEL_CONFIG = {
  LOW: { label: 'Low', dot: 'bg-emerald-500', ring: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', live: true },
  MODERATE: { label: 'Moderate', dot: 'bg-marigold', ring: 'bg-marigold', text: 'text-marigold-600', bg: 'bg-marigold-50', live: true },
  HEAVY: { label: 'Heavy', dot: 'bg-vermilion', ring: 'bg-vermilion', text: 'text-vermilion-700', bg: 'bg-vermilion-50', live: true },
  UNKNOWN: { label: 'No recent report', dot: 'bg-app-text/30', ring: 'bg-app-text/10', text: 'text-app-text/55', bg: 'bg-app-text/5', live: false },
};

export default function PulseIndicator({ level = 'UNKNOWN', waitMinutes, className = '' }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.UNKNOWN;

  const content = (
    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${config.bg} ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {config.live && <span className={`absolute inline-flex h-full w-full rounded-full ${config.ring} animate-pulse-ring`} />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.dot}`} />
      </span>
      <span className={`font-body text-sm font-medium ${config.text}`}>
        {config.label}
        {config.live && typeof waitMinutes === 'number' && (
          <span className="opacity-70"> · ~{waitMinutes} min wait</span>
        )}
      </span>
    </div>
  );

  if (!config.live) return content;

  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-flex"
    >
      {content}
    </motion.div>
  );
}
