# Tripper — Design Spec

**Date:** 2026-08-06
**Status:** Approved design, ready for implementation planning

## 1. Overview

Tripper is a mobile-first, cross-device trip-planning web app. Users build multi-day itineraries as a top-to-bottom timeline of timed events. Between consecutive events the app shows travel distance and time by car/bike/bus/train/walk. It validates each event against its venue's operating hours, auto-inserts meal placeholders when a day spans meal windows, and suggests nearby attractions when a place is added. Plans built on desktop sync to mobile, where the app runs as an installable PWA with offline access and (foreground) GPS-based visited-tracking.

**Primary usage vision:** build the plan on desktop/tablet (rich editing), consume it on mobile while traveling (map + timeline, offline-capable).

## 2. Goals & Non-Goals

**Goals (v1):**
- Multi-day itinerary as a top-to-bottom timeline of timed events
- Travel connectors between events (car/bike/walk = real routing; bus/train = labeled estimate)
- Operating-hours validation with honest ok/warn/unknown states
- Auto meal placeholders (breakfast/lunch/dinner) when a day spans those windows
- Nearby-attraction suggestions when adding a place
- Cross-device sync (build on desktop, view on mobile) via accounts
- PWA: installable + offline on mobile/tablet; plain responsive web app on desktop
- Foreground GPS visited-tracking with two-stage confirm + actual-vs-planned time
- Shareable read-only URL (unguessable token, no viewer login)
- Client-side PDF export in desktop split-view layout

**Non-Goals (v1, deferred):**
- Editable multi-user collaboration (share is view-only)
- Background/passive GPS tracking (foreground only; native path is v2)
- Real schedule-based public-transit routing (estimate only in v1)
- Server-side PDF generation (client-side first)
- Popularity/rating-based suggestion ranking (no such signal in OSM)
- Commercial map-data enrichment (v2 — hours, photos, ratings, better suggestions)

## 3. Layout & UX

**Responsive, one codebase:**
- **Desktop / large screens:** timeline-dominant split view — wider scrollable timeline (left), narrower reference map (right). No PWA install prompt.
- **Mobile / tablet:** tabbed Timeline ↔ Map (one at a time), bottom toggle, floating + to add events. PWA install offered; offline caching enabled.

**Timeline (top-to-bottom):** day chip header; event cards with thumbnail, name, time window, and an hours-status tag (green ✓ open / red ⚠ closes soon / grey verify). Travel connectors between cards (mode icon + time + distance, "~est." label for bus/train). Amber dashed meal placeholders. Blue dashed "💡 add to plan?" suggestion cards.

**Map view:** numbered pins per stop in itinerary order (meals amber), connected by a **straight dashed line** (not road-following). Map is a "shape of the day" overview; per-leg travel detail lives in the timeline. "© OpenStreetMap contributors" attribution always visible.

Mockups: `.superpowers/brainstorm/` (layout.html, mobile.html, mapview.html).

## 4. Architecture

Three tiers:

- **Frontend** — React + Vite + Tailwind + MapLibre GL. Responsive (desktop split / mobile tabbed). PWA layer (manifest + service worker) for install + offline on mobile. Clerk SDK for auth. Talks only to our Express API, never to OSM directly.
- **Backend** — Express (Node). Responsibilities: (a) Trip CRUD keyed to Clerk user id; (b) **provider abstraction** — `SearchProvider`, `PlaceDetailsProvider`, `RoutingProvider`, `NearbyProvider` interfaces with OSM implementations in v1; (c) cache + rate-limit layer over OSM services.
- **Data** — Neon (serverless Postgres, auto-resume on idle). OSM services external: Nominatim (search), OSRM (routing, self-hosted), Overpass (nearby POIs); Wikimedia for photos via Wikidata links.

**Provider abstraction is the load-bearing decision:** it makes the OSM→commercial phasing (v2) and public→self-hosted swaps (v1.5) config/base-URL changes behind stable interfaces, with no frontend rewrite.

**Auth flow:** Clerk JWT from frontend → Express verifies via `@clerk/express` (`clerkMiddleware`/`getAuth`) → authorizes CRUD and scopes data to the user.

## 5. Data Model (Neon Postgres)

```
trips
  id uuid pk · user_id text (Clerk id) · title text
  start_date date · end_date date · created_at timestamptz
  share_token text unique null · is_public bool default false

days
  id uuid pk · trip_id uuid fk · date date · day_index int

events
  id uuid pk · day_id uuid fk · sort_order int
  kind enum 'place'|'meal'|'suggestion_accepted'
  meal_type enum null 'breakfast'|'lunch'|'dinner'
  name text · osm_place_id text null · lat double · lng double
  start_time time null · end_time time null
  opening_hours text null · hours_status enum 'ok'|'warn'|'unknown'
  photo_url text null · notes text null
  -- visited tracking
  status enum 'planned'|'nearby'|'visited' default 'planned'
  actual_time time null
  -- travel FROM this event TO next (denormalized)
  travel_mode enum null 'car'|'bike'|'bus'|'train'|'walk'
  travel_minutes int null · travel_meters int null · travel_estimated bool

place_cache
  query_hash text pk · provider text 'nominatim'|'overpass'|'osrm'
  response jsonb · fetched_at timestamptz · expires_at timestamptz
```

Notes: meal placeholders are real editable `events` rows (persist the chosen eatery). Travel legs denormalized onto the event. `hours_status` computed + stored for instant render, recomputed on time change. `place_cache` enforces OSM rate limits (check cache first).

## 6. Core Logic & Data Flow

1. **Add place** — submit-based search (NOT type-ahead, per Nominatim policy) → Express checks `place_cache` → miss → Nominatim (≤1/sec) → place + lat/lng + opening_hours → inserted into day.
2. **Travel connector** — on order/location change, Express computes leg: car/bike/walk from self-hosted OSRM (real road time/distance); bus/train from heuristic (straight-line ÷ typical speed), `travel_estimated=true` → UI labels "~est." → stored on event.
3. **Hours validation** — event with time + opening_hours → Express parses via `opening_hours` lib against visit window → `ok`/`warn`/`unknown`. Never `ok` when unknown.
4. **Meal placeholders** — after any day edit, rule checks breakfast (~08:00) / lunch (~12:30) / dinner (~19:00) windows; if day spans a window with no meal event there, insert editable `kind='meal'` placeholder; user taps to attach a nearby eatery.
5. **Nearby suggestions** — on place add, Overpass query for tourism/attraction POIs within radius, exclude ones already in trip, rank by distance + tag type (no popularity in v1) → blue suggestion card.
6. **Visited tracking (mobile, foreground)** — location service `watchPosition` → within ~75–100m geofence of an event during its window → Stage 1: dim card + prompt; Stage 2: user confirms → fully greyed/checked, stamp `actual_time`, show vs planned (e.g. "Planned 09:00 · Arrived 09:25 +25m"); can flag running-behind. Geolocation denied → feature disabled, manual mark still works.
7. **Share URL** — generate link flips `is_public=true`, mints `share_token`; public route reads by token, bypasses ownership check; view-only.
8. **PDF export (v1 client-side)** — jspdf + html2canvas render desktop split-view layout, page-broken per day. Keep layout logic reusable for v2 server-side Puppeteer.

## 7. Error Handling & Graceful Degradation

| Failure | Behavior |
|---|---|
| OSM service down / rate-limited | Serve stale cache if available; else "couldn't load — retry"; never block app |
| opening_hours missing/unparseable | `hours_status = unknown` → grey verify (never false green) |
| Routing leg fails | Fall back to straight-line estimate, flagged |
| Geolocation denied | Visited-tracking disabled; manual mark works |
| Offline (mobile) | Cached trips + last map tiles render; edits queue, sync on reconnect |
| Neon / API cold-start | Brief loading state; retry once |

## 8. External Services & Constraints (verified 2026-08-06)

- **MapLibre GL JS** — free/OSS renderer, no key. Tiles need a source: **MapTiler free tier** (~100k loads/mo, key) for v1; self-host later.
- **Clerk** — free = 50k MRU; `@clerk/express` backend JWT verification. Wire Clerk JWT into any row-security.
- **Neon** — free 0.5GB, auto-resume on query (no forced suspend). Expect cold-start after idle.
- **Nominatim (public)** — **autocomplete forbidden**, 1 req/sec, User-Agent required. v1 = submit-search + cache; **self-host in v1.5** to unlock autocomplete.
- **OSRM (public demo)** — non-commercial, 1 req/sec, no uptime guarantee, car/bike/foot only. **Self-host OSRM (Docker) in phase 1.** Confirms no transit → estimate in v1.
- **Overpass (public)** — throttles heavy queries; cache aggressively.
- **Attribution** — "© OpenStreetMap contributors" required on map.

**Hosting:** frontend → Vercel/Netlify; Express + self-hosted OSRM → Render/Railway/Fly; DB → Neon; auth → Clerk. Target 10k planners/month, all free tier.

## 9. Phasing

- **v1 (MVP):** OSM/OSS everywhere with honest fallbacks. MapTiler tiles, public Nominatim (submit-search), self-hosted OSRM, transit estimates, Wikimedia photos, distance/tag suggestions, client-side PDF, view-only share links, foreground visited-tracking.
- **v1.5:** self-host Nominatim (autocomplete + no rate limit).
- **v2:** commercial enrichment behind provider abstraction (real hours, photos/ratings, better suggestions, real transit via OTP+GTFS); server-side Puppeteer PDF; optional Capacitor native wrap for background geofencing and app-store distribution; editable collaboration.

## 10. Testing Strategy

- **Unit** — pure logic: opening_hours parsing (ok/warn/unknown), meal-window insertion, geofence proximity math, actual-vs-planned calc.
- **Provider abstraction** — mock OSM responses; verify raw→shape mapping and cache hit/miss.
- **Integration** — Express endpoints against a test Neon branch; Clerk JWT with test tokens.
- **E2E (later)** — Playwright happy path: create trip → add place → connector + hours → meal → mark visited.
- **Manual mobile checklist** — geolocation, PWA install, offline (can't fully automate).
