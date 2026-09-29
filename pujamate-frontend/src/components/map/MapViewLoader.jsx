'use client';

// src/components/map/MapViewLoader.jsx
// mapbox-gl touches `window`/`document` at module-eval time, which breaks
// Next.js prerendering even inside a 'use client' component (those still
// render on the server for the initial HTML). next/dynamic with ssr:false
// defers the import entirely to the browser.

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl bg-crimson-100/30">
      <span className="font-body text-sm text-crimson-600/60">Loading map…</span>
    </div>
  ),
});

export default MapView;
