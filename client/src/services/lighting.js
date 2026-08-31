// Live lighting data from OpenStreetMap via Overpass: explicit lit/unlit ways plus
// street_lamp nodes as a denser (if less authoritative) proxy signal. Both queries are
// independently fail-soft and session-cached by bounding box - Overpass is slow and
// rate-limited, and this is what keeps a lighting-data hiccup from breaking routing.

const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const FETCH_TIMEOUT_MS = 9000;
const CACHE_TTL_MS = 10 * 60 * 1000;

/** A generous bbox around two {lat, lng} points - covers reasonable routing detours. */
export function boundsFromPoints(start, dest, paddingDeg = 0.03) {
  const south = Math.min(start.lat, dest.lat) - paddingDeg;
  const north = Math.max(start.lat, dest.lat) + paddingDeg;
  const west = Math.min(start.lng, dest.lng) - paddingDeg;
  const east = Math.max(start.lng, dest.lng) + paddingDeg;
  return { south, west, north, east };
}

function cacheKeyFor(bbox) {
  const round = (n) => n.toFixed(3);
  return `lighting:${round(bbox.south)},${round(bbox.west)},${round(bbox.north)},${round(bbox.east)}`;
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Storage full or unavailable (private mode) - fail quietly.
  }
}

async function overpassFetch(query) {
  for (const url of OVERPASS_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      // Public instances often return an HTML status page for a timeout. Treat that
      // as unavailable data instead of raising a misleading JSON parse error.
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) continue;

      return await response.json();
    } catch {
      // Try the next instance; lighting is an optional scoring signal.
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

/**
 * Resolves to { litWays, lampNodes } for the given bbox - litWays are
 * { lit: boolean, coords: [[lat,lng],...] }, lampNodes are { lat, lng }. Both arrays are
 * empty (never null) on failure, so scoring can proceed without a lighting signal rather
 * than breaking.
 */
export async function fetchLightingData(bbox) {
  const cacheKey = cacheKeyFor(bbox);
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const [wayData, nodeData] = await Promise.all([
    overpassFetch(`[out:json][timeout:20];way["highway"]["lit"](${bboxStr});out body geom;`),
    overpassFetch(`[out:json][timeout:20];node["highway"="street_lamp"](${bboxStr});out body;`),
  ]);

  const litWays = (wayData?.elements ?? [])
    .filter((el) => el.type === 'way' && el.geometry?.length >= 2)
    .map((el) => ({
      lit: el.tags?.lit === 'yes',
      coords: el.geometry.map((g) => [g.lat, g.lon]),
    }));

  const lampNodes = (nodeData?.elements ?? [])
    .filter((el) => el.type === 'node')
    .map((el) => ({ lat: el.lat, lng: el.lon }));

  const result = { litWays, lampNodes };
  writeCache(cacheKey, result);
  return result;
}
