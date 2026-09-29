'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react';
import PulseIndicator from '@/components/motion/PulseIndicator';
import { useCrowdStatus } from '@/hooks/useCrowdStatus';
import { useBookmarksStore } from '@/store/useBookmarksStore';
import { loadPandalImages } from '@/lib/pandal-images';

const TYPE_BADGE = {
  THEME: 'Theme',
  TRADITIONAL: 'Traditional',
  BIG_BUDGET: 'Big Budget',
  AWARD_WINNING: 'Award Winning',
  FAMILY_FRIENDLY: 'Family Friendly',
};

export default function PandalCard({ puja, onSelect }) {
  const { status, loading } = useCrowdStatus(puja.id);

  const isBookmarked = useBookmarksStore((state) =>
    state.isBookmarked(puja.id)
  );

  const toggleBookmark = useBookmarksStore(
    (state) => state.toggleBookmark
  );

  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setImageLoading(true);
    loadPandalImages(puja.name).then((result) => {
      if (!cancelled) {
        setImages(result);
        setImageLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [puja.name]);

  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [puja.name]);

  const image = images?.[imageIndex]?.url || null;

  return (
    <article className="group surface-card overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">

      <button
        type="button"
        onClick={() => onSelect?.(puja)}
        className="focus-ring block w-full text-left"
      >
        <div className="relative h-36 overflow-hidden bg-crimson/10">

          {imageLoading ? (
            <div className="h-full w-full animate-pulse bg-app-text/5" aria-label="Loading pandal image" />
          ) : image ? (
            <img
              src={image}
              alt={`${puja.name} previous-year Durga Puja photo`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                if (imageIndex < images.length - 1) {
                  setImageIndex((current) => current + 1);
                } else {
                  event.currentTarget.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/5 px-4 text-center">
              <span className="font-body text-xs text-app-text/45">
                No archival photo available
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">

            <span className="rounded-full bg-white/90 px-2.5 py-1 font-body text-[10px] font-bold text-crimson">
              {TYPE_BADGE[puja.pujo_type] || 'Puja'}
            </span>

            {puja.distance_km !== undefined && (
              <span className="rounded-full bg-black/40 px-2 py-1 font-body text-[10px] font-semibold text-white backdrop-blur">
                {Number(puja.distance_km).toFixed(1)} km
              </span>
            )}

          </div>
        </div>

        <div className="p-4">

          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              <h3 className="font-subheading truncate text-[17px] text-app-text">
                {puja.name}
              </h3>

              <p className="font-body mt-1 flex items-center gap-1 text-xs text-app-text/50">
                <MapPin size={12} />
                {puja.area}
              </p>

            </div>

            <ArrowUpRight
              size={17}
              className="shrink-0 text-app-text/25"
            />

          </div>

          <div className="mt-3 flex items-center justify-between gap-2">

            {loading ? (
              <span className="h-6 w-24 animate-pulse rounded-full bg-app-text/5" />
            ) : (
              <PulseIndicator
                level={
                  status?.crowdLevel ||
                  status?.level ||
                  'UNKNOWN'
                }
                waitMinutes={status?.estimatedWaitMinutes}
              />
            )}

            <span className="inline-flex items-center gap-1 font-body text-[10px] text-app-text/45">
              <Star
                size={11}
                className="fill-marigold text-marigold"
              />

              {puja.avg_rating
                ? Number(puja.avg_rating).toFixed(1)
                : 'New'}
            </span>

          </div>

        </div>
      </button>

      <div className="border-t border-app-border/10 px-4 py-2">

        <button
          type="button"
          onClick={() => toggleBookmark(puja)}
          aria-pressed={isBookmarked}
          className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl py-2 font-body text-xs font-semibold text-app-text/55 hover:bg-app-text/[.04] hover:text-vermilion"
        >
          <Heart
            size={14}
            className={
              isBookmarked
                ? 'fill-vermilion text-vermilion'
                : ''
            }
          />

          {isBookmarked ? 'Saved' : 'Save Pandal'}
        </button>

      </div>

    </article>
  );
}
