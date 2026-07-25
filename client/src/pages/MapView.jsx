import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MapControls, { HAZARD_OPTIONS, SAFE_OPTIONS } from '../components/map/MapControls';
import TripStats from '../components/map/TripStats';
import { createMapTour } from '../components/map/mapTour';
import { useSafeRouteMap } from '../hooks/useSafeRouteMap';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import {
  getSavedRoutes,
  setSavedRoutes,
  readJSON,
  writeJSON,
  STORAGE_KEYS,
} from '../services/storage';
import { KIET_COORDS, INDIA_GATE_COORDS, SAFE_PATH } from '../data/routeData';

const TRIP = { time: '45 min', safety: '98%', distance: '22 km' };

export default function MapView() {
  const [collapsed, setCollapsed] = useState(false);
  const [hazardFilters, setHazardFilters] = useState(HAZARD_OPTIONS.map((o) => o.value));
  const [safeFilters, setSafeFilters] = useState(SAFE_OPTIONS.map((o) => o.value));
  const [saveLabel, setSaveLabel] = useState(null);

  const tourRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const { startName, destName } = useSafeRouteMap({
    containerId: 'map',
    hazardFilters,
    safeFilters,
  });

  // Auto-run the tour on a user's first visit, then never again.
  useEffect(() => {
    tourRef.current = createMapTour();

    let timer;
    if (!readJSON(STORAGE_KEYS.mapTourSeen, false)) {
      timer = setTimeout(() => {
        tourRef.current?.drive();
        writeJSON(STORAGE_KEYS.mapTourSeen, true);
      }, 1500);
    }

    return () => {
      clearTimeout(timer);
      tourRef.current?.destroy?.();
    };
  }, []);

  const toggleFilter = (setter) => (value) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const handleSaveRoute = async () => {
    const savedRoutes = getSavedRoutes();

    const exists = savedRoutes.some(
      (route) => route.startLocation === startName && route.endLocation === destName,
    );

    if (exists) {
      showToast('info', 'Already Saved', 'This route is already in your saved places!', 3000);
      setSaveLabel('already');
      setTimeout(() => setSaveLabel(null), 2000);
      return;
    }

    const routeData = {
      id: Date.now(),
      startLocation: startName,
      endLocation: destName,
      startCoords: KIET_COORDS,
      endCoords: INDIA_GATE_COORDS,
      distance: TRIP.distance,
      time: TRIP.time,
      safetyScore: TRIP.safety,
      path: SAFE_PATH,
      savedAt: new Date().toISOString(),
      savedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    setSavedRoutes([routeData, ...savedRoutes]);
    setSaveLabel('saved');
    showToast('success', 'Route Saved!', `${startName} → ${destName} added to your saved places.`, 3000);

    const goToSaved = await confirm({
      title: 'View Saved Places?',
      message: 'Would you like to view all your saved routes now?',
      variant: 'success',
    });

    if (goToSaved) {
      navigate('/saved-places');
    } else {
      setSaveLabel(null);
    }
  };

  const saveButtonContent = {
    saved: (
      <>
        <i className="fa-solid fa-check" /> Saved!
      </>
    ),
    already: (
      <>
        <i className="fa-solid fa-check" /> Already Saved
      </>
    ),
  }[saveLabel] ?? (
    <>
      <i className="fa-solid fa-heart" /> Save Route
    </>
  );

  return (
    <div className="relative">
      <MapControls
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        onStartTour={() => tourRef.current?.drive()}
        hazardFilters={hazardFilters}
        onHazardChange={toggleFilter(setHazardFilters)}
        safeFilters={safeFilters}
        onSafeChange={toggleFilter(setSafeFilters)}
        onApplyFilters={() =>
          showToast('success', 'Filters Applied', 'Route updated based on your filters.', 2500)
        }
      />

      <div id="map" className="h-screen max-[480px]:h-[100dvh] w-full z-[1]" />

      <button
        type="button"
        onClick={handleSaveRoute}
        className="btn absolute bottom-[110px] right-5 z-[1000] px-6 py-[0.85rem] flex items-center gap-2 whitespace-nowrap bg-save-route text-white shadow-save transition-all duration-300 hover:-translate-y-0.5 hover:shadow-save-hover max-[480px]:!bottom-[100px] max-[480px]:!right-2.5 max-[480px]:!px-5 max-[480px]:!py-3 max-[480px]:!text-[0.85rem] max-[480px]:!w-auto"
      >
        {saveButtonContent}
      </button>

      <TripStats time={TRIP.time} safety={TRIP.safety} distance={TRIP.distance} />
    </div>
  );
}
