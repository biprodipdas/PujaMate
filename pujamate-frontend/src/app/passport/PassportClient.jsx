'use client';

// src/app/passport/PassportClient.jsx
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import CheckInFlow from '@/components/passport/CheckInFlow';
import ZoneProgressBar from '@/components/passport/ZoneProgressBar';
import BadgeGrid from '@/components/passport/BadgeGrid';
import { usePassportStore } from '@/store/usePassportStore';

export default function PassportClient() {
  // Reading individual slices (rather than the whole store object) so this
  // component only re-renders when the fields it actually uses change.
  const visited = usePassportStore((state) => state.visited);
  const zoneProgress = usePassportStore((state) => state.zoneProgress);
  const badges = usePassportStore((state) => state.badges);
  const lastFetchedAt = usePassportStore((state) => state.lastFetchedAt);
  const loading = usePassportStore((state) => state.loading);
  const error = usePassportStore((state) => state.error);
  const refresh = usePassportStore((state) => state.refresh);

  const [celebrateIds, setCelebrateIds] = useState([]);
  const [toast, setToast] = useState(null);

  // Cached data (if any) renders immediately from the persisted store;
  // this just kicks off a background refresh so it's never stale for long.
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCheckedIn(result) {
    const unlockedIds = (result.newlyUnlockedBadges || []).map((b) => b.id);
    setCelebrateIds(unlockedIds);

    if (result.alreadyCheckedIn) {
      setToast(`You've already checked in at ${result.puja.name}.`);
    } else if (unlockedIds.length > 0) {
      setToast(`Checked in at ${result.puja.name} — ${result.newlyUnlockedBadges[0].title} unlocked!`);
    } else {
      setToast(`Checked in at ${result.puja.name}.`);
    }

    setTimeout(() => setToast(null), 3500);
    setTimeout(() => setCelebrateIds([]), 4000);

    refresh();
  }

  const showSkeleton = loading && visited.length === 0 && zoneProgress.length === 0 && !lastFetchedAt;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-subheading text-lg text-crimson">Your Puja Passport</h2>
        <p className="font-body text-sm text-crimson-600/70">
          Check in at pandals to track zone progress and unlock badges.
        </p>
      </div>

      <CheckInFlow onCheckedIn={handleCheckedIn} />

      {showSkeleton ? (
        <div className="flex flex-col gap-3">
          <div className="h-4 w-1/2 animate-pulse rounded bg-crimson-100/50" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-crimson-100/40" />
          <div className="h-2.5 w-full animate-pulse rounded-full bg-crimson-100/40" />
        </div>
      ) : error && !lastFetchedAt ? (
        <p role="alert" className="font-body rounded-xl bg-vermilion-50 px-4 py-3 text-sm text-vermilion-700">
          {error === 'Failed to fetch' ? 'Sign in to view your Puja Passport.' : error}
        </p>
      ) : (
        <>
          {error && lastFetchedAt && (
            <p className="font-body rounded-xl bg-marigold-50 px-3 py-2 text-xs text-marigold-600">
              Showing your last saved passport — couldn&apos;t refresh just now.
            </p>
          )}

          <section className="flex flex-col gap-4">
            <h3 className="font-subheading text-sm text-crimson-600/80">Zone progress</h3>
            {zoneProgress.length === 0 ? (
              <p className="font-body text-sm text-crimson-600/60">No zones tracked yet.</p>
            ) : (
              zoneProgress.map((zone) => <ZoneProgressBar key={zone.area} {...zone} />)
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-subheading text-sm text-crimson-600/80">Badges</h3>
            <BadgeGrid badges={badges} celebrateIds={celebrateIds} />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-subheading text-sm text-crimson-600/80">Visited ({visited.length})</h3>
            {visited.length === 0 ? (
              <p className="font-body text-sm text-crimson-600/60">
                No check-ins yet — tap &quot;I&apos;m Here&quot; at your first pandal.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-crimson-100">
                {visited.map((v) => (
                  <li key={v.pujaId} className="flex items-center justify-between py-2">
                    <span className="font-body text-sm text-crimson">{v.name}</span>
                    <span className="font-body text-xs text-crimson-600/50">
                      {new Date(v.visitedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-5 bottom-24 z-40 mx-auto flex max-w-md items-center gap-2 rounded-xl bg-crimson px-4 py-3 text-white shadow-lg"
            role="status"
          >
            <Sparkles size={16} className="shrink-0 text-marigold" />
            <span className="font-body text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
