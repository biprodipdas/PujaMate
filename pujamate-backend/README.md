# PujaMate Backend — Phase 1

Express.js + native `pg` (no ORM) API server for PujaMate, backed by Neon PostgreSQL.

## Structure

```
pujamate-backend/
├── package.json
├── .env.example
├── scripts/
│   └── runMigrations.js       # applies src/db/migrations.sql
└── src/
    ├── app.js                 # Express app config, route mounting
    ├── server.js               # entrypoint (app.listen)
    ├── db/
    │   ├── pool.js             # pg Pool + query() helper
    │   └── migrations.sql      # full schema (users, pujas, crowd_reports, visited_pujas, routes, reviews)
    ├── middleware/
    │   ├── auth.js             # requireAuth, optionalAuth, requireRole
    │   └── errorHandler.js     # asyncHandler, 404, centralized error responses
    ├── utils/
    │   └── jwt.js              # signToken / verifyToken
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── pujas.controller.js
    │   ├── crowd.controller.js
    │   └── routes.controller.js
    └── routes/
        ├── auth.routes.js      # /auth/register, /auth/login, /auth/me
        ├── pujas.routes.js     # /pujas
        ├── crowd.routes.js     # /crowd/:pujaId
        └── routes.routes.js    # /routes (saved itineraries)
```

## Setup

```bash
cd pujamate-backend
npm install
cp .env.example .env   # then fill in DATABASE_URL and JWT_SECRET
npm run migrate         # applies migrations.sql to your Neon database
npm run dev             # starts the API on http://localhost:4000
```

## Endpoints (Phase 1)

| Method | Path            | Auth        | Description                          |
|--------|-----------------|-------------|---------------------------------------|
| POST   | /auth/register  | none        | Create account, returns JWT           |
| POST   | /auth/login     | none        | Login, returns JWT                    |
| GET    | /auth/me        | Bearer      | Current user profile                  |
| GET    | /pujas          | none        | Search/filter pandals (see query params below) |
| GET    | /pujas/:id      | none        | Pandal detail + avg rating + live crowd level |
| POST   | /pujas          | Bearer/ADMIN| Create a pandal listing               |
| GET    | /crowd/:pujaId  | none        | Time-decayed crowd level + est. wait  |
| POST   | /crowd/:pujaId  | Bearer      | Submit "I'm here" crowd report        |
| GET    | /routes         | Bearer      | List current user's saved routes      |
| GET    | /routes/:id     | Bearer      | Get one saved route                   |
| POST   | /routes         | Bearer      | Save a new itinerary                  |
| PUT    | /routes/:id     | Bearer      | Update a saved itinerary              |
| DELETE | /routes/:id     | Bearer      | Delete a saved itinerary              |
| GET    | /passport       | Bearer      | Visited pandals + zone progress + badges |
| POST   | /passport/checkin | Bearer    | Geofenced "I'm Here" check-in         |
| GET    | /pujas/facilities | none      | Pandals matching any of the requested facility types |
| POST   | /planner/generate | none      | Generate a greedy nearest-neighbor route preview |
| GET    | /emergency/helplines | none    | Static national/state quick-dial numbers |
| GET    | /emergency/nearby | none       | Verified nearby police/hospital/pharmacy/first-aid |
| POST   | /emergency      | Bearer/ADMIN | Add a verified emergency location |

### `GET /pujas` query params
- `search` — matches name or description
- `area` — e.g. `Salt Lake`
- `type` — one of `THEME`, `TRADITIONAL`, `BIG_BUDGET`, `AWARD_WINNING`, `FAMILY_FRIENDLY`
- `lat`, `lng`, `radiusKm` — filters + sorts by distance using the Haversine formula
- `limit`, `offset` — pagination

## Design notes

- **No ORM.** All queries are raw parameterized SQL through `pg`, per the PRD.
- **Crowd time-decay**: `crowd.controller.js` ignores reports older than 60 minutes and
  linearly decays the weight of reports between 15–60 minutes old, so a single stale
  report can't dominate the current status.
- **Error handling**: all async route handlers are wrapped in `asyncHandler` so thrown
  errors (including Postgres constraint violations) are caught by the centralized
  `errorHandler` middleware instead of crashing the process.
- **Auth**: JWT is stateless (`jsonwebtoken`), passwords hashed with `bcryptjs`.
  `requireRole('ADMIN')` gates pandal creation; extend this to other admin routes as needed.

## Phase 3 additions

- **Geofenced check-in** (`src/controllers/passport.controller.js`): `POST /passport/checkin` computes
  the great-circle distance (`src/utils/geo.js`) between the submitted GPS coordinates and the pandal's
  registered `latitude`/`longitude`, and rejects the check-in with `403` if it's farther than
  `GEOFENCE_RADIUS_METERS` (default 200m, configurable in `.env`).
- **Zone progress**: computed per-request from `pujas` LEFT JOINed against the user's `visited_pujas`,
  grouped by `area` — no extra table needed, always reflects the live pandal list.
- **Badges** (`src/utils/badges.js`): derived, not stored — milestone count, night-hopper (8pm–2am
  check-ins), theme-hunter (THEME-type visits), and one auto-generated "`<Zone>` Explorer" badge per
  zone at 100% completion. `checkIn()` diffs badge state before/after the insert so the response's
  `newlyUnlockedBadges` only contains badges this specific check-in unlocked — that's what the frontend
  uses to trigger the celebratory animation rather than re-animating every already-unlocked badge.

## Phase 4 additions

- **`GET /pujas/facilities`** — `?types=toilet,medical,parking,metro,seniorSeating` (comma-separated,
  OR'd — a pandal matching *any* requested type is returned), plus optional `area`/`lat`/`lng`/`radiusKm`.
  Facilities live in each puja's `facilities` JSONB column; boolean flags (`toilet`, `medical`,
  `parking`, `seniorSeating`) are checked with `(facilities->>'type')::boolean IS TRUE`, while `metro`
  is checked for key presence since it's expected to be an object, e.g.
  `{ "name": "Rabindra Sadan", "distanceMeters": 350 }`.
- **`POST /planner/generate`** (`src/controllers/planner.controller.js`) — public, no auth required
  to preview a route. Body: `{ startLat, startLng, timeWindowMinutes?, walkingPreference?
  ('LESS_WALKING'|'HIGH_MOBILITY'), visitDurationMinutes?, budget?, pujaIds? }`. If `pujaIds` is
  omitted, it pulls the nearest 8 pandals to the start point as candidates. It's a **greedy
  nearest-neighbor heuristic**, not a true TSP solver: at each step it picks the closest remaining
  candidate, estimates transit time from distance and a walking-preference-driven mode threshold
  (walk / metro / taxi, with assumed speeds — see the constants at the top of the file), and stops
  adding stops once the time window would be exceeded. Returns `stops` (ordered, with arrival
  estimates), `totalMinutes`, and `unableToFit` (candidates that didn't make the cut). The result's
  `stops` shape matches what `POST /routes` expects, so the frontend can save a generated plan
  directly with the existing saved-routes endpoint.
- `budget` is accepted and echoed back but not used to filter route stops — it's metadata for the
  food-finder feature (PRD 5.5), not a constraint on which pandals get selected.

## Next steps (later phases)
- Reviews endpoints (`/reviews`)
- Food finder endpoints (`/food`)
- Persist generated routes' `unableToFit` suggestions as an alternate/overflow itinerary
- Populate `emergency_services` with real, locally verified data before launch (see Phase 5 notes)
- A moderation step for `verified: true` on admin-submitted emergency services

## Phase 5 — Emergency Module, cleanup, and a real performance/correctness pass

### Cleanup
Removed an orphaned duplicate facilities implementation (`facilities.controller.js`, `facilities.routes.js`,
and a standalone `facilities` table in the migration) left over from an earlier approach — it was never
mounted in `app.js` and had no callers. The live facilities design is the JSONB-on-`pujas` column
documented in the Phase 4 section below.

### Emergency Module (PRD 5.8)
- `GET /emergency/helplines` — static national helpline numbers (Police 100, Ambulance 102, Fire 101,
  Disaster Management 108, Women's/Child helplines, the national emergency number 112). These are
  published, non-location-specific numbers, so they're served as a hardcoded list rather than a DB
  row — always available even before `emergency_services` has been populated for a city.
- `GET /emergency/nearby?lat=&lng=&radiusKm=&category=` — verified police/hospital/pharmacy/first-aid
  locations from the new `emergency_services` table, sorted by distance.
- `POST /emergency` (admin-only) — adds a location with `verified` defaulting to `false`, so a second
  moderation step can confirm accuracy before it's surfaced as trustworthy. **This table ships empty.**
  I deliberately did not seed it with specific hospital/police-station names, coordinates, or phone
  numbers — for a safety-critical feature, fabricated-but-plausible-looking data is worse than an empty
  table with a clear "populate with verified local data" note. The static helplines above are the
  only numbers this module ships with actual confidence in.

### A real bug this pass caught
My first draft of `GET /emergency/nearby` used `HAVING (haversine expression) <= radius` with no
`GROUP BY` — that's invalid SQL (Postgres requires HAVING to reference either an aggregate or a
GROUP BY column), and would have thrown at request time despite reading fine as JavaScript. Caught it
by actually running the query, not just `node --check`-ing the file (see "How this was verified" below).
Fixed by computing distance once in a subquery and filtering in an outer `WHERE`. `listPujas` and
`listFacilities` had a related but non-fatal issue — a `GROUP BY p.id` on a single-table, non-aggregate
query, seemingly there to let `HAVING` reference the computed `distance_km` alias — which works but
forces an unnecessary sort/hash step on every request. Both now use the same subquery pattern.

### Query/index review
- `GET /pujas/facilities` now uses JSONB containment (`facilities @> '{"toilet": true}'`) and
  key-existence (`facilities ? 'metro'`) operators instead of `->>` casts, so it can actually use
  `idx_pujas_facilities_gin` (new) instead of evaluating the expression on every row.
- Added `pg_trgm` + GIN trigram indexes on `pujas.name`/`pujas.description` so the Explore page's
  `ILIKE '%term%'` search can use an index scan instead of a full table scan — a plain btree index
  can't help with a leading wildcard.
- Added `idx_pujas_area_type` (composite) for the Explore page's common Area+Category combo filter.
- Added `idx_visited_pujas_puja_user` — the passport zone-progress query LEFT JOINs on `puja_id`, but
  the existing `UNIQUE(user_id, puja_id)` constraint's index has `user_id` leading, which doesn't serve
  a `puja_id`-led lookup well at scale.
- `PGSSL=false` env var added so the pool can run against local/self-hosted Postgres without SSL
  (used for the verification below) while still defaulting to Neon's required SSL in production.

### 3G/4G payload and latency
- `compression` middleware (gzip/brotli-negotiated) on all responses.
- Pagination is now clamped server-side (`limit` capped at 50, `offset` floored at 0) regardless of
  what the client requests, so a bad or malicious `?limit=` can't force an oversized payload.
- `GET /pujas` list/search responses truncate `description` to 160 characters (`LEFT(description, 160)`)
  — card/list views only need a preview; the field name is unchanged so this isn't a breaking change
  for existing frontend code.
- Short `Cache-Control: public, max-age=60, stale-while-revalidate=120` on slow-changing public GETs
  (`/pujas`, `/pujas/:id`, `/pujas/facilities`) and `max-age=3600` on the static helplines list — lets
  a flaky connection skip a round trip on repeat views. Deliberately **not** applied to `/crowd` or
  `/passport`, which are live/user-specific.

### How this was verified
Rather than trusting `node --check` (which only catches JS syntax, not SQL correctness), I installed
PostgreSQL 16 locally, ran the actual `migrations.sql` (including `pg_trgm` and every new index),
seeded realistic data, and exercised every endpoint — including the ones rewritten in this pass — with
curl: list/search/distance-sort/pagination-clamping on `/pujas`, the OR-logic and GIN-operator rewrite
on `/pujas/facilities`, the full auth → generate-route → geofenced-checkin → passport-badges flow, and
every emergency endpoint including the 400/401 validation paths. Then ran `EXPLAIN` with
`enable_seqscan = off` to confirm the new GIN and trigram indexes are structurally valid and actually
selectable by the planner (a 4-row test table will always prefer a sequential scan on its own, so this
step is necessary to prove the indexes aren't silently broken).

## V2 additions

The V2 features keep the existing PostgreSQL/`pg` architecture. The migration adds only the tables required for persistent Friend Groups and Web Push subscriptions.

Run the existing migration command against the same database:

```bash
npm run migrate
```

For browser Push Notifications, install dependencies from `package.json` and configure:

```env
VAPID_SUBJECT="mailto:you@example.com"
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
```

Generate a VAPID key pair with the `web-push` CLI after dependencies are installed. Put the public key in the frontend as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and the private key only in the backend environment.


## PujaMate V4 data setup

After applying `npm run migrate` to the existing PostgreSQL database, run:

```bash
npm run seed:all
```

This adds curated 2026 Kolkata Puja records only when the same name + area is not already present, and inserts two clearly marked sample Puja Blog stories. Existing records are not deleted or overwritten.

The Bus Route feature uses a small curated route/stage dataset in the frontend and does not require a new database table.
