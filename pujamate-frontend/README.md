# PujaMate Frontend — Phase 2

Next.js (App Router) + Tailwind CSS + Framer Motion design system foundation.

## Structure

```
pujamate-frontend/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json           # @/ → src/ path alias
├── .env.example
└── src/
    ├── app/
    │   ├── layout.js        # loads fonts, mounts Header + MobileNav + PageTransition
    │   ├── page.js           # demo screen exercising the components below
    │   └── globals.css       # palette vars, font aliases, gradient text utility
    ├── lib/
    │   ├── fonts.js           # next/font/google loaders for both PRD typography systems
    │   └── motion-variants.js # single source of truth for animation timing
    └── components/
        ├── layout/
        │   ├── Header.jsx      # sticky header, festive gradient title
        │   └── MobileNav.jsx    # fixed bottom nav (5 core flows)
        └── motion/
            ├── PageTransition.jsx  # fade + slide between routes
            ├── PulseIndicator.jsx  # crowd status badge (LOW/MODERATE/HEAVY)
            └── BottomSheet.jsx      # drag-to-dismiss pandal detail drawer
```

## Setup

```bash
cd pujamate-frontend
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

## Design system notes

- **Palette**: `vermilion` (#E32636), `marigold` (#FFC000), `crimson` (#900C3F) are registered
  in `tailwind.config.js` with tonal scales (50/100/400/600/700) so you're not stuck with only
  the three base hex values — e.g. `bg-vermilion-50` for a light status chip background.
- **Typography — two systems, one switch.** Both PRD approaches are loaded via `next/font/google`
  in `src/lib/fonts.js` and exposed as CSS variables. Tailwind utility classes `font-heading`,
  `font-subheading`, `font-body` (defined in `globals.css`) alias to whichever approach is live.
  The app currently runs **Approach B** (Rozha One / Federo / Poppins) — bolder, more graphic,
  suited to a festival-hopping mobile app. To switch to **Approach A** (Cinzel Decorative /
  Playfair Display / Lato), change the three `var(--font-*-b)` references in the `@layer utilities`
  block of `globals.css` to `-a`. No component code changes needed either way.
- **Festive gradient**: `.text-festive-gradient` utility class implements the PRD's exact gradient
  spec. Used once, on the app name in `Header.jsx` — per design practice, one bold gradient moment
  reads as intentional; gradient-washing every heading reads as templated.
- **Motion**: all animation timing lives in `src/lib/motion-variants.js` so screens stay consistent.
  `prefers-reduced-motion` is respected globally via `globals.css`.

## Components

| Component | Maps to PRD | Notes |
|---|---|---|
| `PageTransition` | Section 4 — Page Transitions | Wrap route content; fade + `y:20→0`, `AnimatePresence mode="wait"` |
| `PulseIndicator` | Section 4 — Crowd Indicator Pulse / 5.2 | Continuous `scale:[1,1.05,1]` pulse + expanding ring, color-coded by level |
| `BottomSheet` | Section 4 — Interactive Bottom Sheets / 5.1 | Drag-to-dismiss via Framer Motion `drag="y"`, threshold + velocity based |
| `Header` | Section 3 — festive gradient | Sticky, minimal, gradient reserved for the app name only |
| `MobileNav` | overall nav | Fixed bottom bar, 5 tabs (Discover / Routes / Passport / Food / Profile), active state from route |

## Phase 3 — Core feature pages

```
src/
├── lib/api.js                     # fetch wrapper for the Express API (base URL, JSON, auth header)
├── hooks/
│   ├── useCrowdStatus.js           # per-pandal live crowd fetch
│   └── useDebouncedValue.js        # debounces the Explore search input
├── components/
│   ├── explore/
│   │   ├── SearchBar.jsx
│   │   ├── FilterBar.jsx            # Area / Type / Distance filters
│   │   └── PandalCard.jsx            # category badge + live PulseIndicator
│   ├── crowd/
│   │   └── CrowdReportButton.jsx     # "I'm Here" LOW/MODERATE/HEAVY reporter
│   └── passport/
│       ├── CheckInFlow.jsx            # geolocate → pick nearby pandal → confirm check-in
│       ├── ZoneProgressBar.jsx         # animated per-zone completion bar
│       └── BadgeGrid.jsx                # badges, spring-unlock via motion-variants.js
└── app/
    ├── explore/
    │   ├── page.js
    │   └── ExploreClient.jsx           # search + filters + grid + detail BottomSheet
    └── passport/
        ├── page.js
        └── PassportClient.jsx           # progress + badges + check-in + toast
```

### How it connects to the backend
Set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `http://localhost:4000`). Auth-required calls
(`/passport`, `/passport/checkin`, crowd report submission) read a JWT from
`localStorage.getItem('pujamate_token')` — Phase 4's auth screens are what will populate that key;
until then, `CrowdReportButton` and `PassportClient` surface a friendly "sign in" message instead of
a raw fetch error when the token is missing.

### Notable implementation choices
- **Explore filters** call the browser Geolocation API only when "Distance" is set to something other
  than "Any distance", then pass `lat`/`lng`/`radiusKm` straight through to `GET /pujas`, which does
  the actual Haversine filtering server-side.
- **PandalCard** fetches its own crowd status independently on mount, so one slow/failed request never
  blocks the rest of the grid from rendering.
- **CheckInFlow** is a two-step geofence by design: the client-side "nearby" lookup (~300m) lets the
  user confirm *which* pandal they mean before the server does the authoritative, tighter distance
  check (`GEOFENCE_RADIUS_METERS`, 200m) on the actual check-in write.
- **BadgeGrid** only pops in badges that are `unlocked`; `PassportClient` passes `celebrateIds` (the
  `newlyUnlockedBadges` from the check-in response) so a freshly-earned badge gets a highlight ring
  distinct from badges that were already unlocked before this visit.

## Next steps (later phases)
- Auth screens (login/register) that populate `pujamate_token` in `localStorage`
- Wire the `/food` nav tab to a real page
- Reviews UI on the pandal detail sheet

## Phase 4 — Route Planner & Map

```
src/components/
├── map/
│   ├── MapView.jsx              # raw mapbox-gl wrapper: pins, route line, facility badges
│   ├── MapViewLoader.jsx          # next/dynamic(ssr:false) wrapper — import THIS, not MapView directly
│   └── FacilitiesOverlay.jsx       # toggle chips: Toilets / Medical / Parking / Metro / Seating
└── route-planner/
    ├── PlannerForm.jsx            # starting location, time window, walking preference, budget
    ├── PandalPicker.jsx            # optional search + multi-select ("favorites-to-route")
    └── RouteTimeline.jsx            # staggered step-by-step itinerary breakdown

src/app/route-planner/
├── page.js
└── RoutePlannerClient.jsx          # orchestrates form state, map, facilities fetch, generate/save
```

### Setup
Requires `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local` (a free public token from
[mapbox.com](https://account.mapbox.com/access-tokens/)). Without it, `MapView` still renders but logs
a console warning and shows a blank/unstyled map — pins and controls still mount correctly.

### Why `MapViewLoader` instead of importing `MapView` directly
`mapbox-gl` touches `window`/`document` at import time, which breaks Next.js's server-side prerendering
even inside a `'use client'` component (those are still rendered once on the server for the initial
HTML). `MapViewLoader` wraps the real component in `next/dynamic(..., { ssr: false })` so the import is
deferred entirely to the browser. Always `import MapView from '@/components/map/MapViewLoader'`.

### How the map colors and layers work
- **Pins** are color-coded by `puja.crowdLevel` (green/marigold/vermilion, falling back to neutral
  crimson when unknown) — mirroring the crowd-status colors from Phase 3 rather than category, since
  "where's it busy right now" is the more actionable signal on a map.
- **Facility badges** are small pill markers layered on top of a pandal's pin, drawn only for the
  currently-toggled types in `FacilitiesOverlay`. They read `puja.facilities` directly when the pandal
  is already in the main list; `RoutePlannerClient` also fetches `GET /pujas/facilities` whenever a
  toggle is active, so amenities on pandals outside the current view still show up.
- **Active route**: `routeStops` (from `POST /planner/generate`) replaces the normal dot pins for
  those pandals with numbered stop markers and draws a dashed connecting line; the map auto-fits its
  bounds to the route.

### Route generation
`RoutePlannerClient` calls `POST /planner/generate` — a backend greedy nearest-neighbor heuristic, not
a true optimizer, so results are a good-enough hopping order rather than a mathematically optimal one.
If the user picked specific pandals via `PandalPicker`, those are the only candidates; otherwise the
backend auto-picks the nearest 8. A generated plan can be saved via **Save this route**, which posts to
the existing (auth-gated) `POST /routes` from Phase 1 — so saving requires being signed in, same
caveat as the crowd-report and passport features from Phase 3.

## Phase 5 — Emergency Module, state management, dark/light theme, splash screen

### Emergency Module (`/emergency`)
```
src/components/emergency/
├── HelplineGrid.jsx        # quick-dial tel: links for static national helplines
└── NearbyServiceList.jsx    # verified police/hospital/pharmacy/first-aid, distance-sorted

src/app/emergency/
├── page.js
└── EmergencyClient.jsx       # geolocates, fetches helplines + nearby services, category filter
```
Reachable from anywhere via the persistent alert-triangle icon in the `Header` (safety-critical
features shouldn't be buried in a tab that requires navigating away from whatever the person is
doing). Nearby services show a "Verified" checkmark only when the backend record's `verified` flag
is true — see the backend README for why that table ships empty rather than pre-seeded.

### Persistent state — Zustand (`src/store/`)
- **`useBookmarksStore`** — bookmarked pandals, persisted to `localStorage`, works without an account.
  `PandalCard` gets a heart toggle wired to it; `RoutePlannerClient` reads it for a one-tap
  "Use my bookmarked pandals" button that fills the route planner's stop list — this is the PRD 5.3
  "Favorites-to-Route" flow.
- **`usePassportStore`** — a persisted cache of the Puja Passport summary (visited pandals, zone
  progress, badges). `PassportClient` now renders instantly from this cache on load, then calls
  `refresh()` in the background — no more blank skeleton every time the page mounts. If a background
  refresh fails, the last-known cached state stays visible with a small inline notice, rather than
  wiping the screen to an error.
- **`StoreHydration.jsx`**, mounted once in the root layout, calls `.persist.rehydrate()` on both
  stores after mount. Both stores use `skipHydration: true` for this exact reason: Next.js prerenders
  with the store's default (empty) state since `localStorage` doesn't exist on the server, and
  hydrating automatically at store-creation time would make the client's first render diverge from
  the server-rendered HTML. Rehydrating explicitly, after mount, avoids that mismatch.

### Dark/Light theme
Built on `next-themes` (`src/store/ThemeProvider.jsx`), with `defaultTheme="dark"` and
`enableSystem={false}` — a deliberate two-state toggle rather than a third "match my OS" state that
would make "dark is the default" ambiguous. `ThemeToggle.jsx` (in the `Header`) is the Sun/Moon
button; it renders a neutral placeholder until mounted, since the active theme can't be known during
server rendering and guessing would cause a hydration mismatch.

**What actually changes with the theme** — the `app-*` Tailwind tokens (`bg-app-bg`, `bg-app-surface`,
`text-app-text`, `border-app-border`, `text-app-accent`), defined as CSS variables in `globals.css`:

| Token | Dark (default) | Light |
|---|---|---|
| `app-bg` | `#140505` | `#FFF8E8` |
| `app-surface` | `#241010` | `#FFFFFF` |
| `app-text` | `#FFF8E7` | `#2A080A` |
| `app-accent` | gold `#F4C430` | burgundy `#8B0000` |
| `app-gold` | `#F4C430` (constant in both) | `#F4C430` |

These are stored as unitless `R G B` triplets and wired up as `rgb(var(--app-bg) / <alpha-value>)` in
`tailwind.config.js` — not plain hex `var()` — specifically so Tailwind's opacity modifiers
(`bg-app-surface/90`, `text-app-text/65`) work; a plain hex CSS variable has no slot for Tailwind to
inject an alpha value into, so those modifiers would silently no-op. This tripped me up once already
while building it — worth calling out since it's an easy mistake to reintroduce when adding new
theme-aware surfaces later.

**What does *not* change with the theme, on purpose**: the existing festival brand palette
(`vermilion`/`marigold`/`crimson` from Phase 2) stays fixed across both themes. Crowd-status colors,
category badges, and primary CTA buttons carry semantic meaning (red = heavy crowd, a specific badge
color per category) that shouldn't flip depending on a display preference — the same reasoning most
apps apply to brand/functional colors versus page chrome. Applied fully to `Header`, `MobileNav`,
`ThemeToggle`, and `SplashScreen`. The content cards built in Phases 1–4 (Explore, Route Planner,
Passport, Emergency) intentionally keep their original `bg-white`/`text-crimson`-based styling in both
themes — retrofitting ~15 files of card content to be theme-aware is a larger visual-QA pass I didn't
want to do blind (this environment can't render a browser to check contrast), so I scoped this pass to
the global chrome and any newly-built component instead of silently shipping unverified dark-mode
styling across the whole app. Extending it is mechanical: swap `bg-white` → `bg-app-surface` and
`text-crimson` → `text-app-text` per component, then actually look at it in a browser.

### Splash screen (`src/components/splash/SplashScreen.jsx`)
Mounted once in the root layout, shown on first load per browser session. A `sessionStorage` flag
(`pujamate_splash_seen`) suppresses it on subsequent client-side navigations until the tab is closed
or the page gets a fresh session; the visibility check happens in `useEffect` with an initial `null`
state specifically so a returning-within-session user never sees a one-frame flash of the splash
before it hides itself.

- **Durga Maa face**: an original stylized gold-silhouette SVG (almond eyes with a kohl flick, a
  mukut/crown built from simple triangular peaks and gem circles, a bindi) — not a reproduction of any
  specific existing artwork, appropriate for a symbolic festive greeting.
- **Diya orbit**: 8 lamps positioned around a ring `div` that spins via a custom `orbit-slow` Tailwind
  animation; each diya sits inside a second `div` running the exact opposite rotation
  (`orbit-slow-reverse`, same 22s duration) so it stays visually upright while its position still
  travels around the circle — a standard nested-transform trick for "upright orbiting item."
  Each flame flickers independently via a staggered `animation-delay`.
  The orbit radius is a CSS custom property (`--orbit-radius`) set responsively via Tailwind's
  arbitrary-property syntax, so the ring fills a larger circle on wider screens.
- **Ambient aura**: a blurred, pulsing radial gradient behind the face (`animate-aura-pulse`).
  Custom keyframes (`flicker`, `aura-pulse`, `orbit`, `orbit-reverse`) live in `tailwind.config.js`.
- **Exit transition**: per the brief, this is a plain CSS opacity transition
  (`opacity-0 pointer-events-none transition-opacity duration-700`) toggled by a `closing` boolean,
  not a Framer Motion unmount — the entrance animation uses Framer Motion (`initial`/`animate` scale
  + fade), but the exit is the explicit CSS-class approach the brief asked for. The component unmounts
  ~700ms after the click, once the fade has actually finished.
- Bilingual CTA: "শুভ শারদীয়া - প্রবেশ করুন" as the primary line, "Start Experience" as a smaller
  English subtitle. The Bengali glyphs fall back to the browser's system font automatically (Poppins/
  the app's Approach-B font stack doesn't include Bengali glyphs), which is normal, expected
  font-fallback behavior and needs no special handling.

## V2 additions

Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` to the same VAPID public key configured on the backend to enable browser Push Notifications.

New V2 routes: `/ai-planner`, `/groups`, `/leaderboard`, `/notifications`.


## V4 features

- Metro and Bus Puja Route pages work from fixed Kolkata station/stop coordinates and do not require device GPS.
- Puja Blog with two sample stories and authenticated community publishing.
- Installable PWA support (`/manifest.webmanifest` + service worker).
