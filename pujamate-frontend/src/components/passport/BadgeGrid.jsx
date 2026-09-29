'use client';

// src/components/passport/BadgeGrid.jsx
// Achievement badges (PRD 5.4). Unlocked badges pop in with the spring
// physics variant; a badge listed in `celebrateIds` (just unlocked by
// the current check-in) gets a brief highlight ring so it stands out
// from badges that were already unlocked before this visit.

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { badgeUnlockVariants } from '@/lib/motion-variants';

export default function BadgeGrid({ badges, celebrateIds = [] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((badge) => {
        const isCelebrating = celebrateIds.includes(badge.id);
        return (
          <motion.div
            key={badge.id}
            variants={badge.unlocked ? badgeUnlockVariants : undefined}
            initial={badge.unlocked ? 'initial' : false}
            animate={badge.unlocked ? 'animate' : false}
            className={`flex flex-col gap-1 rounded-2xl border p-3 ${
              badge.unlocked
                ? 'border-marigold bg-marigold-50'
                : 'border-crimson-100 bg-crimson-50/30 opacity-60'
            } ${isCelebrating ? 'ring-2 ring-vermilion ring-offset-2' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-subheading text-sm text-crimson">{badge.title}</span>
              {!badge.unlocked && <Lock size={14} className="text-crimson-600/40" />}
            </div>
            <p className="font-body text-[11px] leading-snug text-crimson-600/70">
              {badge.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
