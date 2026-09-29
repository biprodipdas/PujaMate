'use client';

// src/components/passport/ZoneProgressBar.jsx
import { motion } from 'framer-motion';

export default function ZoneProgressBar({ area, visitedCount, totalPujas, percent }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-subheading text-sm text-crimson">{area}</span>
        <span className="font-body text-xs text-crimson-600/60">
          {visitedCount}/{totalPujas} · {percent}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-crimson-100/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-marigold to-vermilion"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
