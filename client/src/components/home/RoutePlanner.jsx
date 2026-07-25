import { useEffect, useRef, useState } from 'react';
import { PLACES } from '../../data/places';
import { setSession, SESSION_KEYS } from '../../services/storage';

export default function RoutePlanner({ onFindRoute }) {
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locating, setLocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const destWrapRef = useRef(null);

  // Dismiss the autocomplete when clicking anywhere outside it.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destWrapRef.current && !destWrapRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(PLACES.filter((p) => p.toLowerCase().includes(value.toLowerCase())));
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
        setStart('Current Location');
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
    if (!destination) {
      alert('Please select a destination from the list (e.g., India Gate)');
      return;
    }
    setSession(SESSION_KEYS.routeStart, start || 'Current Location');
    setSession(SESSION_KEYS.routeDest, destination);
    onFindRoute();
  };

  return (
    <div className="glass bg-[rgba(17,24,39,0.7)] p-8 max-[480px]:p-5 flex flex-col gap-6 max-w-[500px] mx-auto shadow-card">
      <div className="input-group">
        <i className="fa-regular fa-circle" />
        <input
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="Your Location"
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

      <div ref={destWrapRef} className="relative">
        <div className="input-group">
          {/* `!` beats the .input-group > i:first-child colour rule */}
          <i className="fa-solid fa-location-dot !text-secondary" />
          <input
            type="text"
            value={destination}
            onChange={handleDestinationChange}
            placeholder="Where to?"
            autoComplete="off"
          />
        </div>

        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-[#1f2937] border border-white/20 rounded-lg mt-1 max-h-[200px] overflow-y-auto z-[100] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]">
            {suggestions.map((place) => (
              <div
                key={place}
                onClick={() => {
                  setDestination(place);
                  setSuggestions([]);
                }}
                className="px-4 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors duration-200 hover:bg-white/10"
              >
                <i className="fa-solid fa-location-dot" />
                <span>{place}</span>
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
