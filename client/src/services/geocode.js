// Live place search via OpenRouteService, replacing the old hardcoded PLACES list.

const ORS_AUTOCOMPLETE_URL = 'https://api.openrouteservice.org/geocode/autocomplete';
const API_KEY = import.meta.env.VITE_ORS_API_KEY;

let activeController = null;

/**
 * Searches for places matching `text`. Cancels any in-flight request from a
 * previous call so fast typing doesn't race stale responses.
 * Resolves to [] on error or empty/short input, never throws.
 */
export async function searchPlaces(text) {
  if (!text || text.trim().length < 3) return [];

  if (activeController) activeController.abort();
  activeController = new AbortController();

  const params = new URLSearchParams({
    api_key: API_KEY,
    text,
    size: '5',
  });

  try {
    const response = await fetch(`${ORS_AUTOCOMPLETE_URL}?${params}`, {
      signal: activeController.signal,
    });
    if (!response.ok) return [];

    const data = await response.json();
    if (!data?.features) return [];

    return data.features.map((feature) => ({
      label: feature.properties.label,
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }));
  } catch (error) {
    if (error.name === 'AbortError') return [];
    console.warn('Error fetching place suggestions:', error);
    return [];
  }
}
