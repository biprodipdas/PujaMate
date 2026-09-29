'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BellRing,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Train,
  Utensils,
  X,
} from 'lucide-react';

import SearchBar from '@/components/explore/SearchBar';
import FilterBar from '@/components/explore/FilterBar';
import PandalCard from '@/components/explore/PandalCard';
import CrowdReportButton from '@/components/crowd/CrowdReportButton';
import BottomSheet from '@/components/motion/BottomSheet';
import PulseIndicator from '@/components/motion/PulseIndicator';
import { useCrowdStatus } from '@/hooks/useCrowdStatus';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { api } from '@/lib/api';
import { useBookmarksStore } from '@/store/useBookmarksStore';
import { useAuthStore } from '@/store/useAuthStore';
import { loadPandalImages } from '@/lib/pandal-images';
import { filterByRegion } from '@/lib/region-utils';

const INITIAL_FILTERS = {
  region: 'KOLKATA',
  area: '',
  type: '',
  radiusKm: '',
  lat: '',
  lng: '',
};

export default function ExploreClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 350);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError('');

    // Backend supports up to 500.
    // PujaMate currently has 52 curated/verified 2026 records.
    const params = {
      limit: 500,
      offset: 0,
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    if (filters.area) {
      params.area = filters.area;
    }

    if (filters.type) {
      params.type = filters.type;
    }

    if (filters.radiusKm) {
      params.radiusKm = filters.radiusKm;
      params.lat = filters.lat;
      params.lng = filters.lng;
    }

    api
      .searchPujas(params)
      .then((data) => {
        if (!cancelled) {
          setPujas(filterByRegion(data.pujas || [], filters.region));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Unable to load pandals.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters]);

  // Metro/Bus/Next Pandal links can open Explore directly at a specific pandal.
  useEffect(() => {
    if (!pujas.length || typeof window === 'undefined') return;
    const requestedId = new URLSearchParams(window.location.search).get('puja');
    if (!requestedId) return;
    const match = pujas.find((item) => String(item.id) === String(requestedId));
    if (match) setSelected(match);
  }, [pujas]);

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-crimson to-vermilion p-6 text-white shadow-xl shadow-crimson/15">
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-marigold/20 blur-2xl" />

        <span className="font-body inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-marigold">
          <Compass size={12} />
          Discover Bengal
        </span>

        <h1 className="font-heading mt-2 text-4xl leading-none">
          Find your next
          <br />
          pandal, anywhere in Bengal.
        </h1>

        <p className="font-body mt-3 max-w-md text-sm leading-6 text-white/70">
          Choose Kolkata, Howrah, Serampore, Chandannagar or another area, then explore verified pandals, facilities and routes.
        </p>
      </section>

      {/* Search + Filters */}
      <div className="sticky top-[73px] z-20 -mx-1 flex flex-col gap-2 bg-app-bg/90 py-1.5 backdrop-blur-xl">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterBar
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-2xl bg-vermilion/10 px-4 py-3 text-sm text-vermilion">
          {error}
        </p>
      )}

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-app-text/50">
          {loading
            ? 'Finding pandals…'
            : `${pujas.length} pandal${pujas.length === 1 ? '' : 's'} found`}
        </p>

        {!loading && pujas.length > 0 && (
          <span className="rounded-full bg-app-text/[.04] px-3 py-1 text-[10px] text-app-text/45">
            2026 curated directory
          </span>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-60 animate-pulse rounded-3xl bg-app-text/5"
            />
          ))}
        </div>
      ) : pujas.length === 0 ? (
        <section className="surface-card p-8 text-center">
          <h3 className="font-subheading text-base text-app-text">
            No matching pandals
          </h3>

          <p className="mt-1 text-sm text-app-text/50">
            Try another area or clear the filters.
          </p>
        </section>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {pujas.map((puja) => (
            <motion.div
              key={puja.id}
              variants={staggerItem}
            >
              <PandalCard
                puja={puja}
                onSelect={setSelected}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <PandalDetailSheet
        puja={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function PandalDetailSheet({ puja, onClose }) {
  const isBookmarked = useBookmarksStore((state) =>
    puja ? state.isBookmarked(puja.id) : false
  );

  const toggleBookmark = useBookmarksStore(
    (state) => state.toggleBookmark
  );
  const user = useAuthStore((state) => state.user);

  const {
    status,
    loading,
  } = useCrowdStatus(puja?.id ?? null);

  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const [subscribed, setSubscribed] = useState(false);
  const [notifyBusy, setNotifyBusy] = useState(false);

  const [imageIndex, setImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    if (!puja) {
      setDetails(null);
      setReviews([]);
      setImageIndex(0);
      setImages([]);
      setImagesLoading(false);
      return;
    }

    let cancelled = false;

    setLoadingDetails(true);
    setImageIndex(0);
    setImagesLoading(true);

    Promise.all([
      loadPandalImages(puja.name),
      api.getPuja(puja.id),
      api.getReviews(puja.id),
    ])
      .then(([resolvedImages, data, reviewData]) => {
        if (!cancelled) {
          setImages(resolvedImages || []);
          setDetails(data);
          setReviews(reviewData.reviews || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setLoadingDetails(false);
          setImagesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [puja]);

  async function review(event) {
    event.preventDefault();

    try {
      const result = await api.createReview(
        puja.id,
        Number(reviewRating),
        reviewComment
      );

      setReviews((value) => [
        {
          ...result.review,
          user_name: 'You',
        },
        ...value,
      ]);

      setReviewComment('');
    } catch (err) {
      setReviewError(err.message);
    }
  }

  async function enableNotifications() {
    setNotifyBusy(true);
    setReviewError('');

    try {
      if (!user) {
        throw new Error('Sign in before enabling crowd notifications.');
      }
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser.');
      }

      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!key) {
        throw new Error(
          'Push notifications are not configured.'
        );
      }

      const permission =
        await Notification.requestPermission();

      if (permission !== 'granted') {
        throw new Error(
          'Notification permission was not granted.'
        );
      }

      const registration =
        await navigator.serviceWorker.register('/sw.js');

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(key),
          });
      }

      await api.subscribeNotifications(
        subscription.toJSON(),
        puja.id
      );

      setSubscribed(true);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setNotifyBusy(false);
    }
  }

  if (!puja) {
    return null;
  }

  const p = details?.puja || puja;

  const crowd =
    status?.crowdLevel ||
    status?.level ||
    details?.currentCrowdLevel ||
    'UNKNOWN';

  function nextImage() {
    setImageIndex((current) =>
      current >= images.length - 1 ? 0 : current + 1
    );
  }

  function previousImage() {
    setImageIndex((current) =>
      current <= 0 ? images.length - 1 : current - 1
    );
  }

  const currentImage = images[imageIndex] || null;

  return (
    <BottomSheet
      open={!!puja}
      onClose={onClose}
      title="Puja Details"
    >
      <div className="-mx-2 flex flex-col gap-5">

        {/* Image Gallery */}
        <div className="relative -mt-2 h-56 overflow-hidden rounded-[1.5rem] bg-app-text/5">

          {imagesLoading ? (
            <div className="h-full w-full animate-pulse bg-app-text/5" />
          ) : currentImage ? (
            <img
              src={currentImage.url}
              alt={`${p.name} previous-year Durga Puja photo`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                if (images.length > 1) {
                  setImageIndex((current) =>
                    current >= images.length - 1 ? 0 : current + 1
                  );
                } else {
                  event.currentTarget.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <span className="font-body text-xs text-app-text/45">No archival photo is available for this pandal yet.</span>
            </div>
          )}

          {currentImage && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />}

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Photo source/year */}
          {currentImage && (
            <div className="absolute left-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-sm">
              {currentImage.label}
            </div>
          )}

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="font-heading text-3xl text-white">
              {p.name}
            </h2>

            <p className="mt-1 flex items-center gap-1 font-body text-xs text-white/75">
              <MapPin size={12} />
              Nearest Metro: {p.area}
            </p>
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === imageIndex
                      ? 'w-4 bg-white'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/35 p-2 text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image attribution */}
        {currentImage?.sourceUrl && (
          <p className="-mt-3 px-2 text-[9px] leading-4 text-app-text/40">
            Previous-year / archival photo.{' '}
            <a
              href={currentImage.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View source
            </a>
          </p>
        )}

        {/* Rating + actions */}
        <div className="px-2">
          <div className="flex items-center justify-between gap-3">

            <div>
              <div className="flex items-center gap-1.5">
                <Star
                  size={15}
                  className="fill-marigold text-marigold"
                />

                <span className="font-heading text-xl text-app-text">
                  {details?.rating?.avg_rating || '—'}
                </span>

                <span className="font-body text-xs text-app-text/45">
                  ({details?.rating?.review_count || 0} reviews)
                </span>
              </div>

              <p className="font-body mt-1 flex items-center gap-1 text-xs text-app-text/50">
                <MapPin size={11} />

                {typeof p.distance_km === 'number'
                  ? `${p.distance_km.toFixed(1)} km away`
                  : 'Kolkata'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-app-border/10 bg-app-surface px-3 py-2 font-body text-xs font-bold text-app-text"
                onClick={() => toggleBookmark(p)}
              >
                <Heart
                  size={13}
                  className={`mr-1 inline ${
                    isBookmarked
                      ? 'fill-vermilion text-vermilion'
                      : ''
                  }`}
                />

                {isBookmarked ? 'Saved' : 'Save'}
              </button>

              <button
                type="button"
                className="rounded-xl bg-vermilion px-3 py-2 font-body text-xs font-bold text-white"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`,
                    '_blank'
                  )
                }
              >
                <Navigation
                  size={13}
                  className="mr-1 inline"
                />

                Navigate
              </button>
            </div>
          </div>
        </div>

        {/* About */}
        <section className="surface-card p-4">
          <h3 className="font-subheading text-sm text-app-text">
            About
          </h3>

          <p className="font-body mt-2 text-sm leading-6 text-app-text/60">
            {p.description ||
              'Discover the theme, history and community story of this Puja.'}
          </p>
        </section>

        {/* Crowd */}
        <section className="surface-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-subheading text-sm text-app-text">
                🚦 Crowd
              </h3>

              <div className="mt-2">
                {loading ? (
                  <span className="text-xs text-app-text/40">
                    Updating…
                  </span>
                ) : (
                  <PulseIndicator
                    level={crowd}
                    waitMinutes={
                      status?.estimatedWaitMinutes
                    }
                  />
                )}
              </div>
            </div>

            <span className="font-body text-[10px] text-app-text/40">
              {status?.sampleSize
                ? `Based on ${status.sampleSize} reports`
                : 'No recent reports'}
            </span>
          </div>

          <div className="mt-4">
            <CrowdReportButton pujaId={p.id} />
          </div>
        </section>

        {/* Facilities */}
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Facility
            icon={Train}
            label="Transport"
            value={
              p.facilities?.metro?.name ||
              'Nearby metro'
            }
          />

          <Facility
            icon={Utensils}
            label="Food Nearby"
            value="Explore food"
          />

          <Facility
            icon={ShieldCheck}
            label="Toilet"
            value={
              p.facilities?.toilet
                ? 'Available'
                : 'Check nearby'
            }
          />

          <Facility
            icon={ShieldCheck}
            label="Medical"
            value={
              p.facilities?.medical
                ? 'Available'
                : 'Nearby help'
            }
          />
        </section>

        {/* Notifications */}
        <section className="surface-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-subheading text-sm text-app-text">
                🔔 Crowd notifications
              </h3>

              <p className="font-body mt-1 text-[11px] text-app-text/45">
                Get a browser alert when this Puja gets a new crowd report.
              </p>
            </div>

            <button
              type="button"
              onClick={enableNotifications}
              disabled={notifyBusy || subscribed}
              className="rounded-xl border border-vermilion/20 px-3 py-2 text-xs font-bold text-vermilion"
            >
              {subscribed
                ? 'Enabled'
                : notifyBusy
                  ? '…'
                  : 'Enable'}
            </button>
          </div>
        </section>

        {/* Reviews */}
        <section className="surface-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-subheading text-sm text-app-text">
              ⭐ Reviews
            </h3>

            <span className="font-body text-[10px] text-app-text/40">
              {reviews.length} shown
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {reviews.slice(0, 4).map((reviewItem) => (
              <div
                key={reviewItem.id}
                className="rounded-xl bg-app-text/[.035] p-3"
              >
                <div className="flex justify-between">
                  <span className="font-body text-xs font-semibold text-app-text">
                    {reviewItem.user_name}
                  </span>

                  <span className="text-[11px] text-marigold">
                    {'★'.repeat(reviewItem.rating)}
                  </span>
                </div>

                {reviewItem.comment && (
                  <p className="font-body mt-1 text-xs leading-5 text-app-text/55">
                    {reviewItem.comment}
                  </p>
                )}
              </div>
            ))}

            {!reviews.length && !loadingDetails && (
              <p className="text-xs text-app-text/45">
                Be the first to review this Puja.
              </p>
            )}
          </div>

          <form
            onSubmit={review}
            className="mt-4 border-t border-app-border/10 pt-4"
          >
            <div className="flex gap-2">
              <select
                value={reviewRating}
                onChange={(event) =>
                  setReviewRating(event.target.value)
                }
                className="rounded-xl border border-app-border/10 bg-app-surface px-3 text-sm text-app-text"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} ★
                  </option>
                ))}
              </select>

              <input
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(event.target.value)
                }
                placeholder="Share your experience"
                className="min-w-0 flex-1 rounded-xl border border-app-border/10 bg-app-surface px-3 py-2 text-xs text-app-text outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-vermilion py-2.5 text-xs font-bold text-white"
            >
              Post review
            </button>

            {reviewError && (
              <p className="mt-2 text-[11px] text-vermilion">
                {reviewError}
              </p>
            )}
          </form>
        </section>
      </div>
    </BottomSheet>
  );
}

function Facility({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-app-border/10 bg-app-surface p-3">
      <Icon
        size={16}
        className="text-vermilion"
      />

      <p className="font-body mt-2 text-[10px] font-bold text-app-text">
        {label}
      </p>

      <p className="font-body mt-1 line-clamp-2 text-[9px] text-app-text/40">
        {value}
      </p>
    </div>
  );
}

function urlBase64ToUint8Array(base64String) {
  const padding =
    '='.repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

  const raw = window.atob(base64);

  return Uint8Array.from(
    [...raw].map((character) =>
      character.charCodeAt(0)
    )
  );
}