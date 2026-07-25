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
import { getSession, SESSION_KEYS } from '../services/storage';

const EXCLUDED_FROM_SUMMARY = ['Unlit Alley', 'Sewer Leakage', 'Damaged Pavement'];

function buildUnsafePopup() {
  const hazardList = HAZARDS.filter((h) => !EXCLUDED_FROM_SUMMARY.includes(h.title))
    .map((h) => `<li>${h.title} (${h.type.replace('_', ' ')})</li>`)
    .slice(0, 5)
    .join('');

  return `
    <div style="text-align: center;">
      <h3 style="color: #ef4444; margin: 0 0 5px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Unsafe Route</h3>
      <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">This route contains reported hazards</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0.75rem 0; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">38 min</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Est. Time</div>
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">62%</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Safety Score</div>
        </div>
        <div>
          <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">19.5 km</div>
          <div style="font-size: 0.7rem; opacity: 0.7;">Distance</div>
        </div>
      </div>

      <div style="text-align: left; margin-top: 0.5rem;">
        <strong style="font-size: 0.85rem;">Hazards on route:</strong>
        <ul style="font-size: 0.85em; padding-left: 20px; margin: 5px 0;">${hazardList}</ul>
      </div>
    </div>`;
}

const SAFE_POPUP = `
    <div style="text-align: center;">
      <h3 style="color: #10b981; margin: 0 0 5px 0;"><i class="fa-solid fa-shield-halved"></i> Verified Safe</h3>
      <p style="margin: 0;">Avoids construction, unlit streets.</p>
    </div>`;

/**
 * Owns the Leaflet instance for the map page: base layers, both route
 * polylines, the filterable hazard/safe-point layers, and live user tracking.
 */
export function useSafeRouteMap({ containerId, hazardFilters, safeFilters }) {
  const mapRef = useRef(null);
  const hazardLayerRef = useRef(null);
  const safeLayerRef = useRef(null);
  const [amenities, setAmenities] = useState([]);

  const startName = getSession(SESSION_KEYS.routeStart) || 'KIET Group of Institutions';
  const destName = getSession(SESSION_KEYS.routeDest) || 'India Gate';

  // --- One-time map construction -------------------------------------------
  useEffect(() => {
    const map = L.map(containerId).setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      className: 'map-tiles',
    }).addTo(map);

    L.marker(KIET_COORDS, { icon: createPinIcon('#10b981') })
      .addTo(map)
      .bindPopup(`<b>Start:</b> ${startName}`);
    L.marker(INDIA_GATE_COORDS, { icon: createPinIcon('#f59e0b') })
      .addTo(map)
      .bindPopup(`<b>Destination:</b> ${destName}`);

    const standardPoly = L.polyline(STANDARD_PATH, { color: '#ef4444', weight: 5, opacity: 0.7 })
      .addTo(map)
      .bindPopup(buildUnsafePopup());

    const safePoly = L.polyline(SAFE_PATH, { color: '#10b981', weight: 6, opacity: 0.9 })
      .addTo(map)
      .bindPopup(SAFE_POPUP);

    hazardLayerRef.current = L.layerGroup().addTo(map);
    safeLayerRef.current = L.layerGroup().addTo(map);

    const group = new L.FeatureGroup([standardPoly, safePoly]);
    const flyTimer = setTimeout(() => {
      map.flyToBounds(group.getBounds(), { padding: [50, 50], duration: 2.5, easeLinearity: 0.25 });
    }, 500);

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
      clearTimeout(flyTimer);
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
    HAZARDS.filter((h) => hazardFilters.includes(h.type)).forEach((hazard) => {
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

  return { mapRef, startName, destName };
}
