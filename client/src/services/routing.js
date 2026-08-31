// Live walking directions from OpenRouteService, replacing the canned demo polylines.

const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
const API_KEY = import.meta.env.VITE_ORS_API_KEY;
const FETCH_TIMEOUT_MS = 12000;

// ORS will return a second "alternative" that's just a bad detour if that's the only
// other option it can find. An alternative is only worth showing if it's not much
// longer than the best route - otherwise it reads as a weird/wrong path, not a choice.
const MAX_ALTERNATIVE_OVERHEAD = 1.2; // alternative can be at most 20% longer

/**
 * Requests walking routes between two {lat, lng} points, plus an alternative when ORS
 * can find one that isn't a drastically worse detour. Resolves to an array of
 * { coords, distanceMeters, durationSeconds } - coords are [lat, lng] pairs, ready for
 * Leaflet - sorted shortest-first and trimmed to genuinely comparable options. Resolves
 * to null on any failure so the caller can fall back to the demo route.
 */
export async function fetchRoutes(start, end) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(ORS_DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        alternative_routes: { target_count: 2, weight_factor: 1.2, share_factor: 0.6 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.features?.length) return null;

    const routes = data.features
      .map((feature) => ({
        coords: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceMeters: feature.properties.summary.distance,
        durationSeconds: feature.properties.summary.duration,
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const [best, ...rest] = routes;
    const goodAlternative = rest.find(
      (route) => route.distanceMeters <= best.distanceMeters * MAX_ALTERNATIVE_OVERHEAD,
    );

    return goodAlternative ? [best, goodAlternative] : [best];
  } catch (error) {
    console.warn('Error fetching route:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Requests a single walking route that's physically forbidden from entering
 * `avoidPolygons` (a GeoJSON Polygon or MultiPolygon). ORS caps avoid_polygons at
 * 200 km² area / 20 km extent - callers should keep polygons small and route-local.
 * Resolves to null on any failure (including the cap being exceeded), so the caller can
 * fall back to ranking-only personalization instead of erroring out.
 */
export async function fetchRouteAvoiding(start, end, avoidPolygons) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(ORS_DIRECTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
        options: { avoid_polygons: avoidPolygons },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const feature = data?.features?.[0];
    if (!feature) return null;

    return {
      coords: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distanceMeters: feature.properties.summary.distance,
      durationSeconds: feature.properties.summary.duration,
    };
  } catch (error) {
    console.warn('Error fetching hazard-avoiding route:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
