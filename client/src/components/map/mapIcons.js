import L from 'leaflet';

// Leaflet injects this markup outside React's tree and the colours are
// data-driven, so these stay as inline styles rather than Tailwind classes.

const HAZARD_STYLES = {
  construction: { icon: 'fa-person-digging', color: '#f59e0b' },
  sewage: { icon: 'fa-water', color: '#ef4444' },
  broken_lights: { icon: 'fa-lightbulb', color: '#fbbf24' },
  broken_roads: { icon: 'fa-road-spikes', color: '#9ca3af' },
};

const SAFE_STYLES = {
  shop: { icon: 'fa-mug-hot', color: '#10b981' },
  safe_zone: { icon: 'fa-shield-halved', color: '#10b981' },
  police: { icon: 'fa-building-shield', color: '#3b82f6' },
  hospital: { icon: 'fa-hospital', color: '#ef4444' },
};

const badge = (iconClass, color) => `
  <div style="background: ${color}; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <i class="fa-solid ${iconClass}" style="color: white; font-size: 1rem;"></i>
  </div>`;

/** Large teardrop pin used for the start and destination markers. */
export const createPinIcon = (color) =>
  L.divIcon({
    className: 'custom-pin',
    html: `<i class="fa-solid fa-location-dot" style="font-size: 2rem; color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });

export const createHazardIcon = (type) => {
  const { icon, color } = HAZARD_STYLES[type] ?? { icon: 'fa-triangle-exclamation', color: '#ef4444' };
  return L.divIcon({
    className: 'hazard-pin',
    html: badge(icon, color),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const createSafePointIcon = (type) => {
  const { icon, color } = SAFE_STYLES[type] ?? { icon: 'fa-shield-halved', color: '#10b981' };
  return L.divIcon({
    className: 'safe-pin',
    html: badge(icon, color),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};
