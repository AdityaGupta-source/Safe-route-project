import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { getSavedRoutes, setSavedRoutes, setSession, SESSION_KEYS } from '../services/storage';

export default function SavedPlaces() {
  const [routes, setRoutes] = useState(() => getSavedRoutes());
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  useEffect(() => {
    setSavedRoutes(routes);
  }, [routes]);

  const handleDelete = async (route) => {
    const confirmed = await confirm({
      title: 'Delete Route?',
      message: `Are you sure you want to remove "${route.startLocation} → ${route.endLocation}" from your saved routes?`,
      variant: 'danger',
      confirmLabel: 'Delete',
    });

    if (!confirmed) return;

    setRoutes((prev) => prev.filter((r) => r.id !== route.id));
    showToast('success', 'Route Deleted', 'The route has been removed from your saved places.', 3000);
  };

  const handleUseRoute = (route) => {
    setSession(SESSION_KEYS.routeStart, route.startLocation);
    setSession(SESSION_KEYS.routeDest, route.endLocation);
    showToast('info', 'Loading Route', 'Redirecting to map...', 2000);
    setTimeout(() => navigate('/map'), 500);
  };

  return (
    <PageLayout title="Saved Places">
      {routes.length === 0 ? (
        <div className="glass p-8 text-center">
          <i className="fa-solid fa-heart text-5xl text-muted mb-4" />
          <h3 className="mb-4">No Saved Routes Yet</h3>
          <p className="text-muted mb-6">
            Save your favorite safe routes from the map for quick access.
          </p>
          <Link to="/map" className="btn btn-primary">
            <i className="fa-solid fa-map" /> Go to Map
          </Link>
        </div>
      ) : (
        routes.map((route) => (
          <div key={route.id} className="glass p-6 mb-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-regular fa-circle text-primary text-[0.8rem]" />
                  <h3 className="m-0 text-[1.1rem]">{route.startLocation}</h3>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-solid fa-location-dot text-secondary text-[0.8rem]" />
                  <h3 className="m-0 text-[1.1rem]">{route.endLocation}</h3>
                </div>
                <p className="text-[0.85rem] text-muted m-0">
                  <i className="fa-regular fa-clock" /> Saved on {route.savedDate}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(route)}
                title="Delete route"
                aria-label={`Delete route from ${route.startLocation} to ${route.endLocation}`}
                className="bg-danger/10 border border-danger/30 text-danger p-2 rounded-lg transition-colors duration-200 hover:bg-danger/20"
              >
                <i className="fa-solid fa-trash" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <div className="text-center">
                <div className="text-[1.2rem] font-bold text-primary">{route.distance}</div>
                <div className="text-xs text-muted">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-[1.2rem] font-bold text-primary">{route.time}</div>
                <div className="text-xs text-muted">Est. Time</div>
              </div>
              <div className="text-center">
                <div className="text-[1.2rem] font-bold text-secondary">{route.safetyScore}</div>
                <div className="text-xs text-muted">Safety Score</div>
              </div>
            </div>

            <div className="flex gap-4 mt-4 max-[480px]:flex-col">
              <Link to="/map" className="btn btn-primary flex-1 text-center">
                <i className="fa-solid fa-map" /> View on Map
              </Link>
              <button
                type="button"
                onClick={() => handleUseRoute(route)}
                className="btn btn-outline flex-1"
              >
                <i className="fa-solid fa-route" /> Use This Route
              </button>
            </div>
          </div>
        ))
      )}
    </PageLayout>
  );
}
