import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../../services/geocode';
import { setSession, setSessionJSON, SESSION_KEYS } from '../../services/storage';

const DEBOUNCE_MS = 300;

export default function RoutePlanner({ onFindRoute }) {
  const [startText, setStartText] = useState('');
  const [startPlace, setStartPlace] = useState(null); // {label, lat, lng} once selected
  const [startSuggestions, setStartSuggestions] = useState([]);

  const [destText, setDestText] = useState('');
  const [destPlace, setDestPlace] = useState(null);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const [locating, setLocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const startWrapRef = useRef(null);
  const destWrapRef = useRef(null);
  const debounceRef = useRef(null);

  // Dismiss whichever autocomplete is open when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startWrapRef.current && !startWrapRef.current.contains(e.target)) {
        setStartSuggestions([]);
      }
      if (destWrapRef.current && !destWrapRef.current.contains(e.target)) {
        setDestSuggestions([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const debouncedSearch = (value, setSuggestions) => {
    clearTimeout(debounceRef.current);
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(value);
      setSuggestions(results);
    }, DEBOUNCE_MS);
  };

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStartText(value);
    setStartPlace(null);
    setHasLocation(false);
    debouncedSearch(value, setStartSuggestions);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestText(value);
    setDestPlace(null);
    debouncedSearch(value, setDestSuggestions);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSession(SESSION_KEYS.userLat, coords.latitude);
        setSession(SESSION_KEYS.userLng, coords.longitude);
        setStartText('Current Location');
        setStartPlace({ label: 'Current Location', lat: coords.latitude, lng: coords.longitude });
        setStartSuggestions([]);
        setHasLocation(true);
        setLocating(false);
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve your location. Please check permissions.');
        setLocating(false);
      },
    );
  };

  const handleSubmit = () => {
    if (!destPlace) {
      alert('Please select a destination from the list');
      return;
    }
    if (!startPlace) {
      alert('Please select a starting point from the list, or use current location');
      return;
    }

    setSessionJSON(SESSION_KEYS.routeStart, startPlace);
    setSessionJSON(SESSION_KEYS.routeDest, destPlace);
    onFindRoute();
  };

  return (
    <div className="glass bg-[rgba(17,24,39,0.7)] p-8 max-[480px]:p-5 flex flex-col gap-6 max-w-[500px] mx-auto shadow-card">
      <div ref={startWrapRef} className="relative">
        <div className="input-group">
          <i className="fa-regular fa-circle" />
          <input
            type="text"
            value={startText}
            onChange={handleStartChange}
            placeholder="Your Location"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            title="Use Current Location"
            aria-label="Use current location"
            className={`bg-transparent p-2 rounded transition-colors duration-200 shrink-0 hover:bg-primary/10 ${
              hasLocation ? 'text-secondary' : 'text-primary'
            }`}
          >
            <i className={`fa-solid ${locating ? 'fa-spinner fa-spin' : 'fa-location-crosshairs'}`} />
          </button>
        </div>

        {startSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-[#1f2937] border border-white/20 rounded-lg mt-1 max-h-[200px] overflow-y-auto z-[100] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
            {startSuggestions.map((place) => (
              <div
                key={`${place.lat},${place.lng}`}
                onClick={() => {
                  setStartText(place.label);
                  setStartPlace(place);
                  setStartSuggestions([]);
                  setHasLocation(false);
                }}
                className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors duration-200 hover:bg-white/10"
              >
                <i className="fa-solid fa-location-dot" />
                <span>{place.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={destWrapRef} className="relative">
        <div className="input-group">
          {/* `!` beats the .input-group > i:first-child colour rule */}
          <i className="fa-solid fa-location-dot !text-secondary" />
          <input
            type="text"
            value={destText}
            onChange={handleDestinationChange}
            placeholder="Where to?"
            autoComplete="off"
          />
        </div>

        {destSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-[#1f2937] border border-white/20 rounded-lg mt-1 max-h-[200px] overflow-y-auto z-[100] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
            {destSuggestions.map((place) => (
              <div
                key={`${place.lat},${place.lng}`}
                onClick={() => {
                  setDestText(place.label);
                  setDestPlace(place);
                  setDestSuggestions([]);
                }}
                className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors duration-200 hover:bg-white/10"
              >
                <i className="fa-solid fa-location-dot" />
                <span>{place.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={handleSubmit} className="btn btn-primary w-full">
        Find Safe Route <i className="fa-solid fa-arrow-right" />
      </button>
    </div>
  );
}
