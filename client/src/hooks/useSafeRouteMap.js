import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  HAZARDS,
  SAFE_POINTS,
  SAFE_PATH,
  STANDARD_PATH,
  KIET_COORDS,
  INDIA_GATE_COORDS,
} from '../data/routeData';
import { createHazardIcon, createPinIcon, createSafePointIcon } from '../components/map/mapIcons';
import { fetchSafeAmenities } from '../services/overpass';
import { fetchRoutes, fetchRouteAvoiding } from '../services/routing';
import { buildAvoidPolygons } from '../services/hazardAvoidance';
import { scoreRoute, buildHazardWeights, hazardsNearRoute, safePointsNearRoute } from '../services/safetyScore';
import { getSession, getSessionJSON, SESSION_KEYS } from '../services/storage';
import { useToast } from '../context/ToastContext';

const DEFAULT_START = { label: 'KIET Group of Institutions', lat: KIET_COORDS[0], lng: KIET_COORDS[1] };
const DEFAULT_DEST = { label: 'India Gate', lat: INDIA_GATE_COORDS[0], lng: INDIA_GATE_COORDS[1] };
const HAZARD_TYPES = [...new Set(HAZARDS.map((h) => h.type))];
const MAX_DISPLAYED_HAZARDS_PER_TYPE = 4;

// "78% - lit for 91% of the walk, 1 hazard nearby" - an explainable score demos far
// better than a bare number (roadmap §1.5). Counts come from the same near-route
// filtering used to build the hazard list, so the popup text and list never disagree.
function breakdownLine(breakdown, hazardCount, safePointCount) {
  if (!breakdown) return '';
  const parts = [];
  parts.push(`${hazardCount} hazard${hazardCount === 1 ? '' : 's'} nearby`);
  parts.push(`${safePointCount} safe point${safePointCount === 1 ? '' : 's'} nearby`);
  return parts.join(' &middot; ');
}

function buildUnsafePopup({ time = '—', safety = '—', distance = '—', hazards = [], safePointsCount = 0, breakdown = null } = {}) {
  const hazardListHtml = hazards
    .slice(0, 5)
    .map((h) => `<li>${h.title} (${h.type.replace('_', ' ')})</li>`)
    .join('');

  const hazardsSection = hazardListHtml
    ? `<div style="text-align: left; margin-top: 0.5rem;">
        <strong style="font-size: 0.85rem;">Hazards on route:</strong>
        <ul style="font-size: 0.85em; padding-left: 20px; margin: 5px 0;">${hazardListHtml}</ul>
      </div>`
    : `<p style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">No reported hazards directly on this route.</p>`;

  const breakdownHtml = breakdown
    ? `<p style="font-size: 0.75rem; opacity: 0.75; margin: 0.5rem 0 0;">${breakdownLine(breakdown, hazards.length, safePointsCount)}</p>`
    : '';

  return `
    <div style="text-align: center;">
      <h3 style="color: #ef4444; margin: 0 0 5px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Unsafe Route</h3>
      <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">This route contains reported hazards</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0.75rem 0; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">${time}</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Est. Time</div>
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">${safety}</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Safety Score</div>
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">${distance}</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Distance</div>
        </div>
      </div>

      ${hazardsSection}
      ${breakdownHtml}
    </div>`;
}

function buildSafePopup({ safety = '—', hazards = [], safePointsCount = 0, breakdown = null } = {}) {
  const breakdownHtml = breakdown
    ? `<p style="font-size: 0.75rem; opacity: 0.75; margin: 0.35rem 0 0;">${breakdownLine(breakdown, hazards.length, safePointsCount)}</p>`
    : '';

  return `
    <div style="text-align: center;">
      <h3 style="color: #10b981; margin: 0 0 5px 0;"><i class="fa-solid fa-shield-halved"></i> Verified Safe</h3>
      <p style="margin: 0;">Safety Score: ${safety}</p>
      ${breakdownHtml}
    </div>`;
}

/**
 * Owns the Leaflet instance for the map page: base layers, both route
 * polylines, the filterable hazard/safe-point layers, and live user tracking.
 */
export function useSafeRouteMap({ containerId, hazardFilters, safeFilters }) {
  const mapRef = useRef(null);
  const hazardLayerRef = useRef(null);
  const safeLayerRef = useRef(null);
  const standardPolyRef = useRef(null);
  const safePolyRef = useRef(null);
  const flyTimerRef = useRef(null);
  const cancelledRef = useRef(false);
  const [amenities, setAmenities] = useState([]);
  const [tripStats, setTripStats] = useState(null);
  const [routeCoords, setRouteCoords] = useState(SAFE_PATH);
  const [applying, setApplying] = useState(false);
  const { showToast } = useToast();

  const start = getSessionJSON(SESSION_KEYS.routeStart, DEFAULT_START);
  const dest = getSessionJSON(SESSION_KEYS.routeDest, DEFAULT_DEST);
  const startName = start.label;
  const destName = dest.label;

  const renderRoutes = (standardCoords, safeCoords, standardPopup, safePopup) => {
    const map = mapRef.current;
    if (!map) return;

    standardPolyRef.current?.remove();
    safePolyRef.current?.remove();

    standardPolyRef.current = L.polyline(standardCoords, { color: '#ef4444', weight: 5, opacity: 0.7 })
      .addTo(map)
      .bindPopup(standardPopup);

    safePolyRef.current = L.polyline(safeCoords, { color: '#10b981', weight: 6, opacity: 0.9 })
      .addTo(map)
      .bindPopup(safePopup);

    const group = new L.FeatureGroup([standardPolyRef.current, safePolyRef.current]);
    clearTimeout(flyTimerRef.current);
    flyTimerRef.current = setTimeout(() => {
      map.flyToBounds(group.getBounds(), { padding: [50, 50], duration: 2.5, easeLinearity: 0.25 });
    }, 500);
  };

  // Fetches routes, scores them against the given hazard filters, and renders whichever
  // scores highest as "safe" - callable at mount and again whenever the user applies new
  // filters, since ticking a hazard type should visibly change the route (roadmap §2).
  const runRouting = async (currentHazardFilters) => {
    const routes = await fetchRoutes(start, dest);
    if (cancelledRef.current) return;

    if (!routes) {
      showToast('warning', 'Live Routing Unavailable', 'Showing a demo route instead.', 4000);
      // scoreRoute is a pure function, so even offline we can score the demo paths for
      // real rather than showing fixed placeholder numbers that ignore what was typed.
      const weights = buildHazardWeights(HAZARD_TYPES, currentHazardFilters);
      const standardScored = scoreRoute(STANDARD_PATH, { hazards: HAZARDS, safePoints: SAFE_POINTS, weights });
      const safeScored = scoreRoute(SAFE_PATH, { hazards: HAZARDS, safePoints: SAFE_POINTS, weights });
      renderRoutes(
        STANDARD_PATH,
        SAFE_PATH,
        buildUnsafePopup({
          safety: `${standardScored.score}%`,
          hazards: hazardsNearRoute(STANDARD_PATH, HAZARDS),
          safePointsCount: safePointsNearRoute(STANDARD_PATH, SAFE_POINTS).length,
          breakdown: standardScored.breakdown,
        }),
        buildSafePopup({
          safety: `${safeScored.score}%`,
          hazards: hazardsNearRoute(SAFE_PATH, HAZARDS),
          safePointsCount: safePointsNearRoute(SAFE_PATH, SAFE_POINTS).length,
          breakdown: safeScored.breakdown,
        }),
      );
      return;
    }

    // Every hazard type always counts; ticked types just count more (roadmap §3.1).
    const weights = buildHazardWeights(HAZARD_TYPES, currentHazardFilters);
    const scoredBaseline = routes.map((route) => ({
      ...route,
      ...scoreRoute(route.coords, { hazards: HAZARDS, safePoints: SAFE_POINTS, weights }),
    }));

    // Mechanism A (roadmap §3.2): only ticked point-hazard types produce an avoidance
    // polygon, which is what makes two users' routes actually diverge.
    const avoidPolygons = buildAvoidPolygons(HAZARDS, currentHazardFilters, routes[0].coords);
    let avoidingRoute = null;
    if (avoidPolygons) {
      const result = await fetchRouteAvoiding(start, dest, avoidPolygons);
      if (cancelledRef.current) return;
      if (result) {
        avoidingRoute = {
          ...result,
          ...scoreRoute(result.coords, { hazards: HAZARDS, safePoints: SAFE_POINTS, weights }),
        };
      }
    }

    // Red is always the plain fastest route, for contrast; green is whichever candidate
    // - a baseline alternative or the hazard-avoiding route - actually scores highest.
    const standardRoute = scoredBaseline[0];
    const candidates = avoidingRoute ? [...scoredBaseline, avoidingRoute] : scoredBaseline;
    const safeRoute = [...candidates].sort((a, b) => b.score - a.score)[0];

    renderRoutes(
      standardRoute.coords,
      safeRoute.coords,
      buildUnsafePopup({
        time: `${Math.round(standardRoute.durationSeconds / 60)} min`,
        safety: `${standardRoute.score}%`,
        distance: `${(standardRoute.distanceMeters / 1000).toFixed(1)} km`,
        hazards: hazardsNearRoute(standardRoute.coords, HAZARDS),
        safePointsCount: safePointsNearRoute(standardRoute.coords, SAFE_POINTS).length,
        breakdown: standardRoute.breakdown,
      }),
      buildSafePopup({
        safety: `${safeRoute.score}%`,
        hazards: hazardsNearRoute(safeRoute.coords, HAZARDS),
        safePointsCount: safePointsNearRoute(safeRoute.coords, SAFE_POINTS).length,
        breakdown: safeRoute.breakdown,
      }),
    );

    setTripStats({
      distanceKm: (safeRoute.distanceMeters / 1000).toFixed(1),
      durationMin: Math.round(safeRoute.durationSeconds / 60),
      safetyScore: safeRoute.score,
    });
    setRouteCoords(safeRoute.coords);
  };

  const applyFilters = async () => {
    setApplying(true);
    try {
      await runRouting(hazardFilters);
      showToast('success', 'Filters Applied', 'Routes updated based on your filters.', 2500);
    } finally {
      if (!cancelledRef.current) setApplying(false);
    }
  };

  // --- One-time map construction -------------------------------------------
  useEffect(() => {
    const map = L.map(containerId).setView([20.5937, 78.9629], 5);
    mapRef.current = map;
    cancelledRef.current = false;

    // CARTO's basemap endpoint now requires an API key. Use OpenStreetMap directly
    // so a first run of this project never fails behind a provider-key screen.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }).addTo(map);

    hazardLayerRef.current = L.layerGroup().addTo(map);
    safeLayerRef.current = L.layerGroup().addTo(map);

    L.marker([start.lat, start.lng], { icon: createPinIcon('#10b981') })
      .addTo(map)
      .bindPopup(`<b>Start:</b> ${startName}`);
    L.marker([dest.lat, dest.lng], { icon: createPinIcon('#f59e0b') })
      .addTo(map)
      .bindPopup(`<b>Destination:</b> ${destName}`);

    runRouting(hazardFilters);

    // Live user position, if the landing page captured one.
    const lat = getSession(SESSION_KEYS.userLat);
    const lng = getSession(SESSION_KEYS.userLng);
    let watchId = null;

    if (lat && lng) {
      const userMarker = L.marker([parseFloat(lat), parseFloat(lng)], {
        icon: L.divIcon({ className: 'user-marker-pulse', iconSize: [20, 20] }),
      }).addTo(map);

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition((pos) => {
          userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        });
      }
    }

    fetchSafeAmenities().then(setAmenities);

    return () => {
      cancelledRef.current = true;
      clearTimeout(flyTimerRef.current);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      map.remove();
      mapRef.current = null;
    };
    // Intentionally runs once: the map is imperative and re-created on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // --- Hazard markers react to the filter checkboxes ------------------------
  useEffect(() => {
    const layer = hazardLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    // The full dataset still drives route avoidance and safety scoring. Rendering every
    // seed point creates hundreds of Leaflet DOM markers, however, which makes panning
    // sluggish. Show a small, representative set for each selected hazard category.
    hazardFilters.flatMap((type) =>
      HAZARDS.filter((hazard) => hazard.type === type).slice(0, MAX_DISPLAYED_HAZARDS_PER_TYPE),
    ).forEach((hazard) => {
      L.marker([hazard.lat, hazard.lng], { icon: createHazardIcon(hazard.type) })
        .bindPopup(`<b>${hazard.title}</b><br>Type: ${hazard.type.replace('_', ' ')}`)
        .addTo(layer);
    });
  }, [hazardFilters]);

  // --- Safe points: bundled seed data plus live Overpass results ------------
  useEffect(() => {
    const layer = safeLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    if (safeFilters.includes('safe_spot')) {
      SAFE_POINTS.forEach((point) => {
        L.marker([point.lat, point.lng], { icon: createSafePointIcon(point.type) })
          .bindPopup(
            `<b>${point.title}</b><br>Type: ${point.type === 'shop' ? 'Coffee Shop' : 'Safe Zone'}`,
          )
          .addTo(layer);
      });
    }

    amenities
      .filter((point) => safeFilters.includes(point.type))
      .forEach((point) => {
        L.marker([point.lat, point.lng], { icon: createSafePointIcon(point.type) })
          .bindPopup(
            `<b>${point.title}</b><br><span style="text-transform: capitalize;">${point.type}</span>`,
          )
          .addTo(layer);
      });
  }, [safeFilters, amenities]);

  return {
    mapRef,
    startName,
    destName,
    startCoords: [start.lat, start.lng],
    destCoords: [dest.lat, dest.lng],
    tripStats,
    routeCoords,
    applyFilters,
    applying,
  };
}
