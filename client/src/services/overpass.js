// Live police station / hospital lookups from the OpenStreetMap Overpass API.

// The public Overpass instances are volunteer-run and one of them can be busy for
// several minutes. Kumi has proved more reliable for this small browser-side query;
// the main instance remains a fallback rather than making the map depend on one host.
const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const BBOX = '28.5,77.1,28.8,77.5';
const MAX_PER_TYPE = 5;
const FETCH_TIMEOUT_MS = 10_000;

const QUERY = `
    [out:json];
    (
      node["amenity"="police"](${BBOX});
      node["amenity"="hospital"](${BBOX});
    );
    out body;
`;

/**
 * Fetches nearby police stations and hospitals, capped at MAX_PER_TYPE each.
 * Resolves to an empty array when the API is unreachable so the map still renders.
 */
export async function fetchSafeAmenities() {
  let data = null;

  for (const url of OVERPASS_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // POST avoids a long encoded URL and, crucially, do not call response.json()
      // for a 504 HTML error page. That was the source of the "Unexpected token <"
      // console error in the map view.
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(QUERY)}`,
        signal: controller.signal,
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) continue;

      const result = await response.json();
      if (Array.isArray(result?.elements)) {
        data = result;
        break;
      }
    } catch {
      // Try the next public instance. Amenities are an enhancement, never a map blocker.
    } finally {
      clearTimeout(timeout);
    }
  }

  if (!data?.elements) return [];

  const counts = { police: 0, hospital: 0 };
  const points = [];

  data.elements.forEach((el) => {
    const type = el.tags?.amenity;
    if (!type || counts[type] === undefined) return;
    if (counts[type] >= MAX_PER_TYPE) return;
    if (!el.lat || !el.lon) return;

    points.push({
      lat: el.lat,
      lng: el.lon,
      type,
      title: el.tags.name || (type === 'police' ? 'Police Station' : 'Hospital'),
    });
    counts[type] += 1;
  });

  return points;
}
