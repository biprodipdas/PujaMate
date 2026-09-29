'use client';

// src/components/route-planner/RouteTimeline.jsx
// Step-by-step itinerary breakdown (PRD 5.3): transit time, transit mode,
// and pandal duration per stop, staggered in on generation.

import { motion } from 'framer-motion';
import { Footprints, TrainFront, Car, Clock } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

const TRANSIT_ICON = {
  WALKING: Footprints,
  METRO: TrainFront,
  TAXI: Car,
};

function formatClockTime(minutesFromNow) {
  const d = new Date(Date.now() + minutesFromNow * 60000);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function RouteTimeline({ stops, totalMinutes, unableToFit }) {
  if (!stops || stops.length === 0) {
    return (
      <p className="font-body py-6 text-center text-sm text-crimson-600/60">
        Set your preferences and generate a route to see the timeline.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.ol
        className="relative flex flex-col gap-5 border-l-2 border-dashed border-crimson-100 pl-5"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {stops.map((stop, index) => {
          const TransitIcon = TRANSIT_ICON[stop.transitMode] || Footprints;
          return (
            <motion.li key={stop.pujaId} variants={staggerItem} className="relative">
              <span className="absolute -left-[27px] flex h-6 w-6 items-center justify-center rounded-full bg-vermilion font-body text-xs font-bold text-white ring-4 ring-white">
                {index + 1}
              </span>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 font-body text-xs text-crimson-600/60">
                  <TransitIcon size={13} />
                  {stop.transitMode === 'WALKING' ? 'Walk' : stop.transitMode === 'METRO' ? 'Metro' : 'Taxi'}
                  {' · '}
                  {stop.transitMinutes} min ({stop.distanceFromPreviousKm} km)
                </div>

                <div className="rounded-xl border border-crimson-100 bg-white p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-subheading text-sm text-crimson">{stop.name}</h4>
                    <span className="font-body shrink-0 text-xs text-crimson-600/60">
                      ~{formatClockTime(stop.arrivalMinutesFromStart)}
                    </span>
                  </div>
                  <p className="font-body text-xs text-crimson-600/60">{stop.area}</p>
                  <div className="mt-1.5 flex items-center gap-1 font-body text-xs text-crimson-600/70">
                    <Clock size={12} /> {stop.visitMinutes} min visit
                  </div>
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>

      <p className="font-body text-xs text-crimson-600/60">
        Total trip time: <span className="font-medium text-crimson">{totalMinutes} min</span>
      </p>

      {unableToFit && unableToFit.length > 0 && (
        <div className="rounded-xl bg-marigold-50 p-3">
          <p className="font-body text-xs font-medium text-marigold-600">
            Didn&apos;t fit in your time window:
          </p>
          <p className="font-body text-xs text-crimson-600/70">
            {unableToFit.map((p) => p.name).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
