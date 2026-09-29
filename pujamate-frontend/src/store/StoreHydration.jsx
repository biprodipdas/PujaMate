'use client';

// src/store/StoreHydration.jsx
// Mounted once in the root layout. Both stores use skipHydration so their
// localStorage-backed state loads only after mount, avoiding a mismatch
// between server-rendered HTML (which can't see localStorage) and the
// client's first render. Renders nothing.

import { useEffect } from 'react';
import { useBookmarksStore } from './useBookmarksStore';
import { usePassportStore } from './usePassportStore';

export default function StoreHydration() {
  useEffect(() => {
    useBookmarksStore.persist.rehydrate();
    usePassportStore.persist.rehydrate();
  }, []);

  return null;
}
