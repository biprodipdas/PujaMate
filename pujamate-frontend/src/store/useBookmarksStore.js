// src/store/useBookmarksStore.js
'use client';

// Bookmarked pandals, persisted to localStorage so they survive a reload
// and work without an account — this is the "Favorites" list the Route
// Planner's one-click generation (PRD 5.3) reads from.
//
// `skipHydration: true` + manual rehydrate (see StoreHydration.jsx) avoids
// a server/client markup mismatch: Next.js prerenders this component with
// the store's default (empty) state, and localStorage is only readable in
// the browser, so hydrating automatically on store creation would produce
// different HTML than the server rendered.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useBookmarksStore = create(
  persist(
    (set, get) => ({
      bookmarks: [], // [{ id, name, area, latitude, longitude, pujo_type }]

      isBookmarked: (pujaId) => get().bookmarks.some((b) => b.id === pujaId),

      toggleBookmark: (puja) =>
        set((state) => {
          const exists = state.bookmarks.some((b) => b.id === puja.id);
          return {
            bookmarks: exists
              ? state.bookmarks.filter((b) => b.id !== puja.id)
              : [
                  ...state.bookmarks,
                  {
                    id: puja.id,
                    name: puja.name,
                    area: puja.area,
                    latitude: puja.latitude,
                    longitude: puja.longitude,
                    pujo_type: puja.pujo_type,
                  },
                ],
          };
        }),

      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    {
      name: 'pujamate-bookmarks',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
