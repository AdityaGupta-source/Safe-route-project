// Thin wrapper around Web Storage so pages never touch raw keys or JSON parsing.

export const STORAGE_KEYS = {
  savedRoutes: 'savedRoutes',
  trustedContacts: 'trustedContacts',
  mapTourSeen: 'mapTourSeen',
};

export const SESSION_KEYS = {
  routeStart: 'routeStart',
  routeDest: 'routeDest',
  userLat: 'userLat',
  userLng: 'userLng',
};

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode) - fail quietly.
  }
}

export const getSavedRoutes = () => readJSON(STORAGE_KEYS.savedRoutes, []);
export const setSavedRoutes = (routes) => writeJSON(STORAGE_KEYS.savedRoutes, routes);

export const getTrustedContacts = () => readJSON(STORAGE_KEYS.trustedContacts, []);
export const setTrustedContacts = (contacts) => writeJSON(STORAGE_KEYS.trustedContacts, contacts);

export const getSession = (key) => sessionStorage.getItem(key);
export const setSession = (key, value) => sessionStorage.setItem(key, value);

export function getSessionJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setSessionJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private mode) - fail quietly.
  }
}
