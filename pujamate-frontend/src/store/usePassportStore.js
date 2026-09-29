// src/store/usePassportStore.js
'use client';

// A lightweight, persisted cache of the user's Puja Passport summary
// (visited count, zone progress, badges) so any screen — the header, a
// nav badge, the emergency page's "you're checked in at X" context, etc.
// — can show it instantly without waiting on a fresh fetch, then quietly
// refresh in the background. The server (GET /passport) remains the
// source of truth; this is a cache, not a replacement.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';

export const usePassportStore = create(
  persist(
    (set, get) => ({
      visited: [],
      zoneProgress: [],
      badges: [],
      lastFetchedAt: null,
      loading: false,
      error: null,

      visitedCount: () => get().visited.length,

      // Most recent check-in, used to answer "am I actively at a pandal
      // right now" style questions elsewhere in the app (e.g. surfacing
      // nearby emergency services for that pandal's area).
      mostRecentVisit: () => {
        const visited = get().visited;
        if (visited.length === 0) return null;
        return [...visited].sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt))[0];
      },

      refresh: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.getPassport();
          set({
            visited: data.visited || [],
            zoneProgress: data.zoneProgress || [],
            badges: data.badges || [],
            lastFetchedAt: new Date().toISOString(),
            loading: false,
          });
          return data;
        } catch (err) {
          set({ loading: false, error: err.message || 'Could not refresh passport.' });
          return null;
        }
      },

      reset: () => set({ visited: [], zoneProgress: [], badges: [], lastFetchedAt: null, error: null }),
    }),
    {
      name: 'pujamate-passport-cache',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Only persist the actual data — loading/error are transient UI state
      partialize: (state) => ({
        visited: state.visited,
        zoneProgress: state.zoneProgress,
        badges: state.badges,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
