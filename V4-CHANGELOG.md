# PujaMate V4 — Final Changes

Base: PUJA APP - V3-Metro-Community

## Implemented / public-launch pass

1. Metro route
- Metro page no longer depends on device GPS.
- Requests up to 500 pandals instead of 50.
- Latest crowd report is included in the pandal listing response.
- Radius and crowd filters now use the backend crowd field.
- Full station list remains visible.

2. 2026 Puja data
- Added `scripts/seedPujas2026.js`.
- Seed is non-destructive: same name + area is not inserted twice.
- Existing database records are never deleted or overwritten.
- Source names are based on public 2026 Kolkata Puja directories/guides.
- Coordinates in this seed are locality/map-matching coordinates and should be verified against the final entrance point before public launch.

3. 2026 data verification
- Added `scripts/verifyPujas2026.js` to apply current public-directory map coordinates only to PujaMate-owned 2026 seed rows.
- Added 52 map-verified 2026 pandal coordinates to the verification set.
- Added `DATA-SOURCES-2026.md` with source and data-quality notes.

4. Puja Blog
- New `blog_posts` table.
- Public blog listing and detail pages.
- Two clearly marked PujaMate sample stories.
- Logged-in users can publish a story.
- Optional cover image via the existing Cloudinary setup.
- Optional pandal tag.
- New `/blog` and `/blog/[id]` pages.

5. Bus Route
- New `/bus` page.
- Route selector, stop-by-stop timeline, radius filter and crowd filter.
- Uses fixed Kolkata stop coordinates; no current-location dependency.
- Route/stage names use WBTC intra-city route data.
- Includes the curated WBTC route/stage set shipped with this release, with map-matched stop coordinates for nearby-pandal matching.
- Current device GPS is not used on this page.
- The UI explicitly treats these as route information, not live bus tracking or arrival-time data.

6. Next Pandal
- New authenticated `/next-pandal` page.
- Excludes pandals already checked in by the user.
- Uses current GPS when available; if permission is denied, falls back to the most recently visited pandal as the recommendation origin.
- Does not unlock a recommendation before the user has at least one real check-in.
- Shows nearest unvisited pandal, distance, rating and recent crowd status.

7. Community Photo Wall
- Existing V3 feature retained.
- Pandal picker now requests the full curated listing rather than only 50 records.

8. Food Finder + location modes
- Food Finder now supports Explore Kolkata mode without GPS by selecting a pandal as the search center.
- Near Me mode remains available when the user grants location permission.
- Live map search is used instead of maintaining a large restaurant database.

9. Installable app
- Added PWA manifest and 192/512 app icons.
- Added PWA shortcuts, portrait orientation and app metadata.
- Service worker uses network-first behavior for app pages and never caches auth/API routes.
- Browser install prompt plus manual iOS/unsupported-browser installation guidance.
- Existing push notification handling retained.

## Android packaging
- Added `ANDROID-APP.md` with the production TWA/APK/AAB packaging path.
- A fake APK/AAB is intentionally not shipped: the production HTTPS domain and final API URL are required before generating a valid public-launch Android binary.

## Database

No new PostgreSQL database.
No Prisma.
Existing tables are preserved.

Run on the existing database:

```bash
npm run migrate
npm run seed:all
```

`seed:all` runs the non-destructive 2026 Puja seed and the two sample blog seeds.

## Verification

- Backend JavaScript syntax checks passed for the modified/new backend files.
- Full Next.js production build could not be completed in this environment because frontend dependencies were not installed and `npm ci` timed out.

## Public-review fixes applied

- Fixed Wikimedia image handling: curated file mappings are resolved to reliable Wikimedia thumbnail URLs, with a best-effort Commons search for pandals without a curated mapping.
- Fixed pandal detail gallery so missing images no longer crash the detail sheet.
- Fixed Metro/Bus/Next Pandal links so `/explore?puja=<id>` opens the requested pandal detail.
- Fixed crowd UI so `UNKNOWN` is shown as `No recent report` instead of being incorrectly rendered as Low crowd.
- Hardened push notification setup with browser capability checks, existing-subscription reuse, and sign-in guidance.
- Hardened production startup by rejecting missing/weak JWT secrets in production.
- Normalized configured CORS origins.
- Hardened the 2026 verification seed SQL parameter typing to avoid PostgreSQL 42P08 parameter-type inference errors.
- Added `TESTING-CHECKLIST-2026.md` covering GPS-dependent features, non-GPS features, and local Kolkata GPS simulation.
