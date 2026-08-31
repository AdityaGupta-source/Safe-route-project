# Safe Route — Roadmap

**Goal:** turn a finished-looking prototype into a product that actually computes
something. The map is the product, and right now it is a canned demo.

> **Status (2026-08-02): Phase 1 is done and verified.** Geocoding, real ORS routing,
> the safety scoring engine, lighting data, and personalization (§1.1–1.5) are built and
> confirmed working live — tested by actually driving the app: real place search routed
> correctly between typed destinations, and ticking different hazard filters on the
> KIET → India Gate demo corridor produced visibly different routes/scores (486 min /
> 40.5 km / 98% vs 487 min / 40.6 km / 99%), confirming the core personalization
> mechanism. Sections 1 and the table below describe the pre-Phase-1 state and are now
> historical. **Next up: Phase 2 (backend).**

Companion docs: [requirement.md](requirement.md) (product brief) ·
[design.md](design.md) (system design).

---

## 1. Where the project stands today

The React frontend is complete and works. The problem is that almost nothing behind it
is real.

### What genuinely works

- All 10 routes render; navigation, sidebar, modals, toasts
- Trusted Contacts — full CRUD, persisted to `localStorage`
- Saved Places — reads/writes `localStorage`
- Map renders tiles, polylines, markers, popups, and filter toggles
- Police stations and hospitals are **live data** from the OpenStreetMap Overpass API
  (`client/src/services/overpass.js`)

### What only looks like it works

| What the user does | What actually happens |
| --- | --- |
| Types any destination | Autocomplete matches 5 hardcoded strings (`client/src/data/places.js`) |
| Clicks "Find Safe Route" | Map always draws the same KIET→India Gate lines, whatever was typed |
| Reads "45 min / 98% / 22 km" | Literal strings hardcoded in `client/src/pages/MapView.jsx` |
| Ticks hazard filters | Only shows/hides markers — routing is unaffected |
| Clicks "Apply Filters" | Fires a toast. Nothing recalculates. |
| Sees "Well-Lit Paths" | No lighting data exists in the codebase |
| Reads "Crowd Sourced — report hazards" | There is no way to report a hazard |
| Presses SOS | A toast appears. Nothing is sent anywhere. |
| Clicks "Enable Tracking" | Nothing happens |

The two polylines in `client/src/data/routeData.js` are pre-baked OSRM output for a
single origin/destination pair. The 98% safety score is a string, not a calculation.

---

## 2. The vision

**The hazard checkboxes stop meaning "show me these pins" and start meaning
"this is what I personally want to avoid."**

A user who ticks only *Broken Lights* gets a route that keeps them on lit streets —
even if it passes a construction site, because they said lighting is what matters to
them. A different user, same two points, different ticks, **different route**.

This is the "Personal Safety Profiles" feature already promised in
[requirement.md](requirement.md), and it gives the existing filter panel a real job.

---

## 3. How personalization works

### 3.1 The weighting rule

Every hazard type **always counts** — nothing is ever ignored, so we never route
someone through an open sewer just because they didn't tick it. Ticking a type raises
its weight rather than switching it on:

```
weight(type) = BASE + (ticked ? BOOST : 0)     // e.g. BASE 1, BOOST 3
                                                // ticked types count 4× unticked
normalize weights to sum to 1
```

### 3.2 Two mechanisms, because the hazards are not the same kind of thing

This distinction drives the whole design.

**A. Point hazards — construction, sewage, broken roads.**
These are dots on a map. Buffer each into a polygon (~40m, `@turf/buffer`) and pass it
to the router as `avoid_polygons`; the route is then physically forbidden from entering.
**Only ticked types produce avoidance polygons** — this is what makes two users' routes
visibly diverge.

**B. Lighting — a property of streets, not a point.**
You cannot draw a polygon around darkness. In OSM, lighting is an attribute of each way
(`lit=yes/no`) plus `highway=street_lamp` nodes, and no free router accepts "prefer lit
streets" as a routing rule. So lighting is handled by **ranking**: request several route
alternatives, measure the lit percentage of each, pick the best.

> **Known ceiling:** OpenRouteService returns ~3 alternatives, so this picks the best of
> a small set rather than computing an optimal lit path. On some routes the improvement
> will be modest. Removing this ceiling requires a self-hosted router with custom
> weighting — out of scope, but worth knowing.

### 3.3 The full flow

```
1. Geocode start + destination
2. Request N route alternatives (walking profile)
   └─ if any point-hazard types are ticked, also request a route with
      avoid_polygons built from ONLY those types
3. Score every candidate with the user's weights (all types counted)
4. Green = highest score, Red = plain fastest route, for contrast
5. Show the score breakdown so the choice is explainable
```

"Apply Filters" becomes the trigger that re-runs this.

---

## 4. Roadmap

### Step 0 — Pre-flight check (10 minutes, do first)

Verify OSM `lit` coverage in the demo corridor before committing to lighting as the
headline feature. Tag coverage across Indian cities is uneven.

Run `way[lit]` over the demo bbox on [overpass-turbo.eu](https://overpass-turbo.eu).
If coverage is thin, either pick a demo route where it isn't, or down-rank lighting and
lead with the point hazards.

> **Status: unresolved.** An initial check found **662 street lamp nodes across 76,445
> roads** in the KIET→India Gate corridor — thin. The more important number (how many
> roads carry the `lit` tag) timed out twice because Overpass was busy. Finish this
> before betting the demo on lighting.

---

### Phase 1 — Real routing + personalization — ✅ Done

This is the phase that turns a mockup into a product.

#### 1.1 Geocoding

Replace `client/src/data/places.js` with live geocoding (ORS `/geocode/autocomplete`,
or Nominatim to stay keyless). The autocomplete UI in
`client/src/components/home/RoutePlanner.jsx` already has the dropdown, outside-click
dismissal and selection handler — only the data source changes.

Store `{label, lat, lng}`, not a bare string. `SESSION_KEYS.routeStart/routeDest` in
`client/src/services/storage.js` currently carry display text only, which is exactly why
the map cannot honour what the user typed.

#### 1.2 Routing

**Provider: OpenRouteService** — free tier 2,500 req/day, walking profile,
`alternative_routes`, and `avoid_polygons`. The only free option that can route *around*
things, which mechanism A depends on. Requires a free account (no card).

In `client/src/hooks/useSafeRouteMap.js`, replace the imported `STANDARD_PATH` /
`SAFE_PATH` constants with a fetch. Keep the existing layer-group structure.

> **Constraint to design for:** ORS caps `avoid_polygons` at **200 km² area and 20 km
> extent**. The KIET→India Gate corridor is ~22 km, so a MultiPolygon spanning it will be
> rejected. Include only hazards within ~500m of the baseline route, and if the extent
> still exceeds the cap, fall back to ranking-only. **Build the fallback from day one** —
> it will trigger on long routes.

#### 1.3 Safety scoring engine

New pure-function module, `client/src/services/safetyScore.js` — no React, so it stays
unit-testable and reusable by the backend later.

```
scoreRoute(route, { weights, hazards, lighting, safePoints, timeOfDay })
  -> { score, breakdown, worstSegment }

1. Split route into ~50m segments               (@turf/line-chunk)
2. Per segment, compute 0–100 sub-scores:
     lighting    OSM lit tag + street_lamp density within 25m
     hazards     hazards within 30m (@turf/point-to-line-distance),
                 by type severity AND age decay — a 2-hour-old report
                 should outweigh a 3-week-old one
     safePoints  distance to nearest police / hospital / open shop
                 (already fetched in services/overpass.js)
     infra       sidewalk / footway / surface tags
3. Combine using the user's normalized weights
4. routeScore = 0.7 × length-weighted mean
              + 0.3 × worst segment
```

Two deliberate choices:

- **The worst-segment term matters.** A plain average lets one frightening 200m stretch
  hide behind 20 pleasant kilometres. A route is only as safe as its worst block.
- **Time of day is a multiplier, not a factor.** Per [design.md](design.md) the same
  street is 85 at rush hour and 60 at 2 AM — scale the lighting weight after dark rather
  than adding a separate term.

> **On design.md's "Historical Data (15%)":** there is no free real-time crime-incident
> feed for Indian cities. Either drop it and redistribute the weight, or seed a small
> static dataset **clearly labelled as sample data**. Presenting invented incident
> numbers as real is the one thing that would undermine an otherwise genuine project.

#### 1.4 Lighting data

Extend `client/src/services/overpass.js` — which already has the query/parse/fail-soft
pattern — with a bbox query for `way[lit]` and `node[highway=street_lamp]`. This is what
makes "Well-Lit Paths" real.

*Note: Overpass rejects requests without a User-Agent header (HTTP 406). The browser
sends one automatically; a server-side proxy must set it explicitly.*

#### 1.5 Make the UI show real numbers

- Trip stats in `MapView.jsx` come from the routing response, not string literals
- Route popup lists hazards **actually near that route**, not the global array
- Show the breakdown — *"78% — lit for 91% of the walk, 1 hazard nearby."* An
  explainable score demos far better than a bare number
- Reword the filter panel in `client/src/components/map/MapControls.jsx`: it currently
  reads as show/hide pins, but now means *"what should we avoid?"*
- **Swap the basemap.** Dark mode is currently `filter: invert(100%) hue-rotate(180deg)`
  on raster tiles — a CSS hack that makes colours approximate and labels read oddly.
  Point the tile layer at a real dark basemap (e.g. CARTO Dark Matter, free for
  non-commercial with attribution) and delete the filter rule from
  `client/src/index.css`. ~2 lines; the biggest visual win available.
- **Departure time picker** on the route planner — the score already varies by time of
  day, but in a daytime demo that behaviour is invisible.

#### 1.6 Cheap additions while the routing code is open

- **Wheelchair profile.** ORS ships a `wheelchair` profile alongside `foot-walking`
  (kerbs, surfaces, inclines) — close to a parameter change, and it delivers the
  accessibility promise in [requirement.md](requirement.md).
- **Shareable route links** — encode start, destination and preferences in the URL
  (`?from=…&to=…&avoid=lights`). No backend required.

#### Caching — required, not optional

Overpass is slow and rate-limited; limits *will* be hit during a live demo. Cache by
bounding box with a TTL — `sessionStorage` now, server-side in Phase 2.

---

### Phase 2 — Backend

Fill the skeleton already scaffolded in `server/`.

- **Prisma models:** `User`, `Contact`, `SavedRoute`, `HazardReport`, `Trip`,
  `SafetyProfile` (persist hazard preferences so they follow the user across devices)
- **JWT auth** — make Login and Register real
- **Move contacts and saved routes off `localStorage`.**
  `client/src/services/storage.js` is the single choke point, so swapping its internals
  touches one file rather than every page
- **Routing proxy** (`/api/routes/plan`) — keeps the ORS key server-side and gives one
  place to cache Overpass results

> **Pull the proxy forward.** With Phase 1 alone the ORS key ships inside the public JS
> bundle, and this repo is public. For a graded demo a rotatable, rate-limited key may be
> acceptable — but building just this one endpoint early removes the problem permanently.
> Required before any public deployment.

---

### Phase 3 — Close the promise gap

Features the UI already advertises but does not have.

#### "Walk with me" — deviation detection

Highest value here, because the landing page already promises it and the *Enable
Tracking* button goes nowhere. Also nearly free given the rest of the plan:
`watchPosition` already runs in `useSafeRouteMap.js` for the live user marker, and
off-route detection is the same `@turf/point-to-line-distance` call the scoring engine
needs.

Logic: >~50m off route, or stationary for N minutes → prompt, then alert. Plus an
"arrived safely" notification to close the loop.

#### Journey sharing — route-linked, deliberately not a friends map

When a route is planned, prompt *"share this journey with…"*. Watchers open the app to
follow live progress against the planned route and ETA; the share **auto-expires on
arrival**. Escalation to WhatsApp is manual and initiated by the watcher — never
automatic, so a permanent location link never lands in a group chat.

- **Differentiator:** Snapchat and Life360 share a *person*, indefinitely. This shares a
  *trip* — known destination, planned route, safety score, deviation alerts. They have no
  idea where you are supposed to be; this does. Expect the "Life360 already does this"
  objection and answer it with that.
- **Needs real accounts and a friend graph** (invite / accept / revoke). The existing
  Trusted Contacts are local name/phone records with no account linkage, so this is a new
  system, not an extension — though a contact may optionally link to an app account.
- **Realtime transport:** Supabase Realtime free tier, or ~10s polling (simpler, and
  adequate at walking speed).
- **Staleness safeguard — non-negotiable.** Browsers suspend background tabs, so location
  updates stop the moment the walker locks their phone, and the watcher sees a frozen dot
  and assumes all is well. The watcher view must show "updated Ns ago" prominently and
  alarm when updates stall. *A safety feature that fails silently is worse than none,
  because someone is relying on it.* Screen Wake Lock helps while the app is foregrounded;
  full reliability needs a native wrap.

#### Hazard reporting

Click map → pick type → submit, then verify/dispute votes from other users, with reports
expiring unless refreshed (the lifecycle [design.md](design.md) already specifies). This
is what turns the hazard layer from seed data into live community data — the whole
premise of the scoring.

#### Working SOS + real history

Capture live location, notify trusted contacts, route to nearest safe haven; add a
`tel:112` emergency dial. Record completed trips and retire the hardcoded arrays in
`client/src/data/rideHistory.js` and the "coming soon" History page.

> **Alerting mechanism (free-tier constraint):** server-sent SMS costs money at any
> volume, so SOS and deviation alerts open the user's own SMS or WhatsApp with a
> prefilled message and live location link (`sms:` / `wa.me`). The message sends from
> their number, costs nothing, and matches how many real safety apps work.
> Trade-off: one extra tap to confirm rather than fully automatic sending.

---

### Phase 4 — Polish

- Route-level code splitting (`React.lazy`) — the bundle is 531 KB and Vite warns;
  Leaflet and GSAP need not load on the login page
- Compress hero images (500–900 KB PNGs → WebP). Also defuses a latent
  `ScrollTrigger.refresh()` risk, since late-loading images shift layout and can leave a
  scroll-reveal section stuck invisible
- Accessibility: modal focus traps, keyboard nav, ARIA on the map
- Verify the map page on a real phone browser

---

## 5. Suggested order

```
0. Pre-flight: verify OSM lit coverage                                    ✅ done (thin, but not blocking)
1. Geocoding + real routing            (§1.1–1.2)                        ✅ done
2. Scoring engine + lighting data      (§1.3–1.4)                        ✅ done
3. Wire checkboxes to routing + real numbers in UI  (§1.5–1.6)           ✅ done
4. Backend proxy + auth                (Phase 2)                         ← next
5. Deviation detection, then journey sharing, then hazard reporting  (Phase 3)
```

**After step 3 the product genuinely works** and the core idea is demonstrable.
Everything after that deepens it. Steps 0–3 were verified working live on 2026-08-02 —
see the status note at the top of this document. **Phase 2 (backend) is next.**

---

## 6. Decisions on record

| Decision | Rationale |
| --- | --- |
| **Personalized routing is the core bet** | If only one thing is fully working, it is this. More technically novel and harder to dismiss. Journey sharing is a bonus, not a co-headline. |
| **Unticked hazards still count** | Ticking raises a type's weight rather than switching it on, so a route is never sent past an open sewer just because it wasn't ticked. |
| **Existing checkboxes, no new controls** | `MapControls.jsx` already has the four toggles wired to state; they just gain real meaning. |
| **Journey-scoped sharing, not a friends map** | Better privacy, clearer differentiator, less work. |
| **Keep Leaflet** | Already works; ~42 KB vs MapLibre's ~5×, and `divIcon` HTML markers are a Leaflet strength. The bottleneck is routing logic, not rendering. |
| **No UI redesign** | The design is coherent; the problem is that nothing computes. New UI is additive (score breakdown, time picker, reporting flow). |
| **Web only for now** | Mobile deferred — see below. |
| **Everything on free tiers** | No credit card required anywhere. |

---

## 7. Deliberately not doing

- **A general-purpose chatbot.** The most common hackathon add-on, and it works against
  the core use case: someone walking home alone at 11 PM wants a route in one tap, not a
  conversation. It also costs money per call. The AI story here is already the
  multi-factor safety scoring.
  *If* natural language is wanted later, the one worthwhile use is parsing a **route
  request** ("get me home avoiding dark streets") into a destination plus hazard weights
  — feeding the personalization engine rather than sitting beside it.
- **An always-on friends map.** Journey-scoped sharing covers the same need with better
  privacy and less work.
- **Rewriting the map with react-leaflet.** The imperative code in `useSafeRouteMap.js` is
  already isolated behind a hook; converting risks the popups and custom divIcons for no
  gain.
- **Self-hosting OSRM/Valhalla.** The only way to get true "prefer lit streets" weighting,
  but setup and hosting far exceed this project's needs.
- **Foot-traffic / crowd density.** [design.md](design.md) lists it as a scoring factor,
  but there is no free data source — it would mean inventing numbers. Cut it or label it
  as a future integration.

### Mobile — deferred, with reasoning preserved

A walking-safety app is inherently mobile, so this will matter eventually.

- **Do not rewrite in React Native** — it means rebuilding every screen (no DOM, no
  Leaflet, no Tailwind classes) for the same feature set.
- **Use Capacitor when the time comes.** It wraps the existing React build in a native
  shell, so current code ships nearly as-is while gaining native geolocation, background
  location and push. Free and open source.
- **The real trigger is background tracking, not app-store presence.** Deviation
  detection, journey sharing and locked-screen SOS cannot work reliably in a browser
  because phones suspend background tabs. Everything else runs fine as a PWA.
- [design.md](design.md) promises one-touch SOS without unlocking, and background
  tracking. A web app fundamentally cannot do either — worth softening the doc rather
  than appearing to ship something that does not work.

---

## 8. Known risks

| Risk | Mitigation |
| --- | --- |
| **Overpass rate limits / timeouts** | Already observed twice during research. Cache aggressively by bbox with TTL; this is what kills live demos. |
| **Thin OSM `lit` coverage** | Resolve step 0 before making lighting the headline. |
| **ORS `avoid_polygons` 20 km cap** | Build the ranking-only fallback from day one. |
| **ORS key exposed in bundle** | Pull the Phase 2 routing proxy forward before deploying publicly. |
| **Free hosting cold starts** | Render-style free tiers sleep after ~15 min idle; first request can hang 30–60s. Warm it before demoing. |
| **Hazard data is seeded** | Judges will ask where it comes from. Lean on the genuinely real inputs (lighting, police/hospital from OSM), and state plainly that hazards are sample data pending community reports. |
| **Silent tracking failure** | See the staleness safeguard in Phase 3. |

---

## 9. External dependencies — all free

| Service | Free tier | Key needed |
| --- | --- | --- |
| OpenRouteService (routing + geocoding) | 2,500 req/day | Yes — free signup, no card |
| Overpass API (hazards, lighting, amenities) | Public, rate-limited | No |
| Map tiles (OSM / CARTO dark) | Free with attribution | No |
| Turf.js, Leaflet, React, Tailwind, GSAP | Open source | No |
| Postgres (Neon / Supabase) | Free tier | Account |
| Hosting (Vercel / Netlify / Render) | Free tier | Account |

The one genuine cost is server-sent SMS, avoided by using device-native `sms:` /
`wa.me` links.

*Free-tier terms change — verify at signup rather than trusting this table.*

---

## 10. How to verify each phase

Check in the browser, not just the compiler.

- **Personalization (the headline test):** same origin and destination, run twice — once
  with only *Broken Lights* ticked, once with only *Construction*. The two routes must
  visibly differ, and each breakdown must show the ticked factor dominating. If the paths
  come out identical, the weighting is not working.
- **Routing:** enter two unrelated places (Connaught Place → Noida Sector 18). The old
  build always drew KIET→India Gate; a correct build draws what was typed.
- **Long-route fallback:** pick endpoints >20 km apart and confirm it degrades to
  ranking-only rather than erroring on the ORS polygon cap.
- **Scoring:** the same route at noon vs 11 PM must produce different scores.
- **Lighting:** spot-check scored segments against [OSM](https://www.openstreetmap.org)
  to confirm `lit` tags are read correctly.
- **Regression:** contacts CRUD, saved routes and map filters work end-to-end today —
  re-test after the storage changes in Phase 2.
- **Bundle:** `npm run build` in `client/`; use modular `@turf/*` imports, not the
  meta-package, and watch the chunk size.
