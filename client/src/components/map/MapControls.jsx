import { Link } from 'react-router-dom';

export const HAZARD_OPTIONS = [
  { value: 'construction', icon: 'fa-person-digging', label: 'Construction', chip: 'bg-warning/20 text-warning' },
  { value: 'sewage', icon: 'fa-water', label: 'Open Sewage', chip: 'bg-danger/20 text-danger' },
  { value: 'broken_lights', icon: 'fa-lightbulb', label: 'Broken Lights', chip: 'bg-dark/50 text-star border border-star' },
  { value: 'broken_roads', icon: 'fa-road-spikes', label: 'Broken Roads', chip: 'bg-muted/20 text-muted' },
];

export const SAFE_OPTIONS = [
  { value: 'police', icon: 'fa-building-shield', label: 'Police Stations', color: '#3b82f6' },
  { value: 'hospital', icon: 'fa-hospital', label: 'Hospitals', color: '#ef4444' },
  { value: 'safe_spot', icon: 'fa-shield-halved', label: 'Safe Spots', color: '#10b981' },
];

const SECTION_HEADING =
  'my-2 text-[0.9rem] text-muted uppercase tracking-[1px] max-[480px]:text-[0.8rem]';
const TOGGLE_ROW =
  'flex items-center gap-3 text-[0.9rem] cursor-pointer max-[768px]:text-[0.85rem] max-[480px]:text-[0.8rem] max-[480px]:gap-2';
const CHECKBOX = 'accent-primary w-4 h-4 max-[480px]:w-[0.9rem] max-[480px]:h-[0.9rem]';
const LEGEND = 'w-6 h-6 flex items-center justify-center rounded-full text-xs max-[480px]:w-5 max-[480px]:h-5';

export default function MapControls({
  collapsed,
  onToggleCollapse,
  onStartTour,
  hazardFilters,
  onHazardChange,
  safeFilters,
  onSafeChange,
  onApplyFilters,
  applyingFilters,
}) {
  return (
    <div
      id="map-controls"
      className={`glass absolute top-5 left-5 max-[768px]:top-2.5 max-[768px]:left-2.5 z-[1000] flex flex-col gap-6 transition-[width,padding] duration-300 overflow-y-auto ${
        collapsed
          ? 'w-[70px] p-4 lg:w-[70px] max-[1024px]:w-[60px] max-[480px]:w-[60px] max-[480px]:max-h-[60px] max-[480px]:overflow-hidden'
          : 'w-[320px] p-6 max-[1024px]:w-[280px] max-[768px]:w-[260px] max-[768px]:p-5 max-[768px]:gap-5 max-[768px]:max-h-[calc(100vh-20px)] max-[480px]:w-[calc(100%-20px)] max-[480px]:p-4 max-[480px]:gap-4 max-[480px]:max-h-[50vh]'
      }`}
    >
      {/* Always-visible buttons */}
      <div className="absolute top-4 right-4 flex gap-2 max-[480px]:gap-[0.4rem] z-10">
        <button
          type="button"
          onClick={onStartTour}
          title="Start Tour"
          aria-label="Start guided tour"
          className={`w-10 h-10 max-[480px]:w-9 max-[480px]:h-9 rounded-full bg-transparent text-primary border-2 border-primary flex items-center justify-center text-[1.1rem] max-[480px]:text-base transition-all duration-300 shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:bg-primary hover:text-white hover:scale-105 ${
            collapsed ? 'opacity-0 pointer-events-none scale-[0.8]' : ''
          }`}
        >
          <i className="fa-solid fa-circle-question" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          title="Toggle Filters"
          aria-label="Toggle filters panel"
          className="w-10 h-10 max-[480px]:w-9 max-[480px]:h-9 rounded-full bg-primary text-white flex items-center justify-center text-[1.1rem] max-[480px]:text-base transition-all duration-300 shadow-[0_2px_10px_rgba(79,70,229,0.3)] hover:bg-primary-dark hover:scale-105"
        >
          <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Collapsible body */}
      <div
        className={`flex flex-col gap-6 overflow-hidden transition-[opacity,max-height] duration-300 ${
          collapsed ? 'opacity-0 max-h-0 pointer-events-none' : 'opacity-100 max-h-[2000px]'
        }`}
      >
        <div>
          <h2 className="text-[1.25rem] mb-1 max-[768px]:text-[1.1rem] max-[480px]:text-base">
            Route Filters
          </h2>
          <p className="text-[0.8rem] opacity-70 max-[480px]:text-xs">
            What should we avoid? Ticked hazards are routed around — everything else still counts, just less.
          </p>
        </div>

        <div>
          <h4 id="hazards-section" className={SECTION_HEADING}>
            Hazards
          </h4>
          <div id="hazards-toggles" className="flex flex-col gap-3 max-[768px]:gap-[0.6rem] max-[480px]:gap-2">
            {HAZARD_OPTIONS.map((option) => (
              <label key={option.value} className={TOGGLE_ROW}>
                <input
                  type="checkbox"
                  className={CHECKBOX}
                  checked={hazardFilters.includes(option.value)}
                  onChange={() => onHazardChange(option.value)}
                />
                <div className={`${LEGEND} ${option.chip}`}>
                  <i className={`fa-solid ${option.icon}`} />
                </div>
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 id="safe-zones-section" className={SECTION_HEADING}>
            Safe Zones
          </h4>
          <div id="safe-zones-toggles" className="flex flex-col gap-3 max-[768px]:gap-[0.6rem] max-[480px]:gap-2">
            {SAFE_OPTIONS.map((option) => (
              <label key={option.value} className={TOGGLE_ROW}>
                <input
                  type="checkbox"
                  className={CHECKBOX}
                  checked={safeFilters.includes(option.value)}
                  onChange={() => onSafeChange(option.value)}
                />
                <div className={LEGEND} style={{ background: option.color }}>
                  <i className={`fa-solid ${option.icon}`} />
                </div>
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onApplyFilters}
          disabled={applyingFilters}
          className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {applyingFilters ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Applying...
            </>
          ) : (
            'Apply Filters'
          )}
        </button>

        <Link to="/" className="btn btn-outline w-full text-center">
          <i className="fa-solid fa-arrow-left" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
