// Builds ORS avoid_polygons input from ticked hazard types - the mechanism that lets a
// route be physically forbidden from entering a hazard zone, not just scored down for
// passing near one. See docs/ROADMAP.md §3.2 (mechanism A).

import buffer from '@turf/buffer';
import pointToLineDistance from '@turf/point-to-line-distance';
import { lineString, point as turfPoint } from '@turf/helpers';

const HAZARD_BUFFER_KM = 0.04; // ~40m
const ROUTE_PROXIMITY_KM = 0.5; // only avoid hazards actually near this trip

const toLngLat = ([lat, lng]) => [lng, lat];

/**
 * Returns a GeoJSON MultiPolygon built from ticked-type hazards within ~500m of the
 * baseline route, or null if there's nothing to avoid - only ticked types produce
 * avoidance polygons, which is what makes two users' routes visibly diverge.
 */
export function buildAvoidPolygons(hazards, tickedTypes, baselineRouteCoords) {
  if (tickedTypes.length === 0 || baselineRouteCoords.length < 2) return null;

  const routeLine = lineString(baselineRouteCoords.map(toLngLat));

  const nearbyTicked = hazards.filter((hazard) => {
    if (!tickedTypes.includes(hazard.type)) return false;
    const dist = pointToLineDistance(turfPoint([hazard.lng, hazard.lat]), routeLine, { units: 'kilometers' });
    return dist <= ROUTE_PROXIMITY_KM;
  });

  if (nearbyTicked.length === 0) return null;

  const polygons = nearbyTicked.map((hazard) => {
    const circle = buffer(turfPoint([hazard.lng, hazard.lat]), HAZARD_BUFFER_KM, { units: 'kilometers' });
    return circle.geometry.coordinates;
  });

  return { type: 'MultiPolygon', coordinates: polygons };
}
