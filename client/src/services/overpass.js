// Live police station / hospital lookups from the OpenStreetMap Overpass API.

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BBOX = '28.5,77.1,28.8,77.5';
const MAX_PER_TYPE = 5;

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
  try {
    const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(QUERY)}`);
    const data = await response.json();
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
  } catch (error) {
    console.warn('Error fetching real map data:', error);
    return [];
  }
}
