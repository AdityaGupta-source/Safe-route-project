document.addEventListener('DOMContentLoaded', () => {
    // Access data from global scope (defined in data.js)
    const { KIET_COORDS, INDIA_GATE_COORDS, HAZARDS, STANDARD_PATH, SAFE_PATH, SAFE_POINTS } = window.SAFE_ROUTE_DATA;

    // Initialize Map - Start with a broad view of India
    const map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Coded by Team Infernix',
        className: 'map-tiles'
    }).addTo(map);

    // CSS filter for Dark Mode map tiles
    document.querySelector('.leaflet-tile-pane').style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';

    // Icons
    const createIcon = (color) => {
        return L.divIcon({
            className: 'custom-pin',
            html: `<i class="fa-solid fa-location-dot" style="font-size: 2rem; color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></i>`,
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });
    };

    const hazardIcon = (type) => {
        let iconClass = 'fa-triangle-exclamation'; // default
        let color = '#ef4444';

        switch (type) {
            case 'construction': iconClass = 'fa-person-digging'; color = '#f59e0b'; break;
            case 'sewage': iconClass = 'fa-water'; color = '#ef4444'; break;
            case 'broken_lights': iconClass = 'fa-lightbulb'; color = '#fbbf24'; break;
            case 'broken_roads': iconClass = 'fa-road-spikes'; color = '#9ca3af'; break;
        }

        return L.divIcon({
            className: 'hazard-pin',
            html: `<div style="background: ${color}; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <i class="fa-solid ${iconClass}" style="color: white; font-size: 1rem;"></i>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    };

    const safePointIcon = (type) => {
        let iconClass = 'fa-shield-halved';
        let color = '#10b981'; // Green for everything safe

        if (type === 'shop') iconClass = 'fa-mug-hot';
        if (type === 'police') { iconClass = 'fa-building-shield'; color = '#3b82f6'; } // Police Blue
        if (type === 'hospital') { iconClass = 'fa-hospital'; color = '#ef4444'; } // Hospital Red

        // Ensure "Safe Points" are consistently Green-themed if they aren't explicit emergency services
        if (type === 'safe_zone' || type === 'shop') color = '#10b981';

        return L.divIcon({
            className: 'safe-pin',
            html: `<div style="background: ${color}; width: 2rem; height: 2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                    <i class="fa-solid ${iconClass}" style="color: white; font-size: 1rem;"></i>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    };

    // User Marker
    let userMarker = null;

    // Retrieve custom names from Landing Page
    const startName = sessionStorage.getItem('routeStart') || "KIET Group of Institutions";
    const destName = sessionStorage.getItem('routeDest') || "India Gate";

    // Markers for Start and End
    L.marker(KIET_COORDS, { icon: createIcon('#10b981') }).addTo(map).bindPopup(`<b>Start:</b> ${startName}`);
    L.marker(INDIA_GATE_COORDS, { icon: createIcon('#f59e0b') }).addTo(map).bindPopup(`<b>Destination:</b> ${destName}`);

    // Polylines (Real Road Geometry)
    // Standard (Unsafe) - Red
    const standardPoly = L.polyline(STANDARD_PATH, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    // Hazard List for Popup
    const hazardList = HAZARDS.filter(h => !['Unlit Alley', 'Sewer Leakage', 'Damaged Pavement'].includes(h.title))
        .map(h => `<li>${h.title} (${h.type.replace('_', ' ')})</li>`).slice(0, 5).join('');

    standardPoly.bindPopup(`
        <div style="text-align: center;">
            <h3 style="color: #ef4444; margin: 0 0 5px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Unsafe Route</h3>
            <p style="margin: 0;">contains reported hazards:</p>
            <ul style="text-align: left; font-size: 0.9em; padding-left: 20px; margin-top: 5px;">${hazardList}</ul>
        </div>
    `);

    // Safe (Optimized) - Green
    const safePoly = L.polyline(SAFE_PATH, {
        color: '#10b981',
        weight: 6,
        opacity: 0.9
    }).addTo(map);

    safePoly.bindPopup(`
        <div style="text-align: center;">
            <h3 style="color: #10b981; margin: 0 0 5px 0;"><i class="fa-solid fa-shield-check"></i> Verified Safe</h3>
            <p style="margin: 0;">Avoids construction, unlit streets.</p>
        </div>
    `);

    // Fly to the route
    const group = new L.featureGroup([standardPoly, safePoly]);
    setTimeout(() => {
        map.flyToBounds(group.getBounds(), {
            padding: [50, 50],
            duration: 2.5,
            easeLinearity: 0.25
        });
    }, 500);


    // Layers
    const hazardLayer = L.layerGroup().addTo(map);
    const safeLayer = L.layerGroup().addTo(map);

    // 1. Render Pre-defined Safe Points
    if (SAFE_POINTS) {
        SAFE_POINTS.forEach(point => {
            L.marker([point.lat, point.lng], { icon: safePointIcon(point.type) })
                .bindPopup(`<b>${point.title}</b><br>Type: ${point.type === 'shop' ? 'Safe Rest Stop' : 'Verified Safe Zone'}`)
                .addTo(safeLayer);
        });
    }

    // 2. Fetch REAL Data from Overpass API (Police & Hospitals)
    // Bounding Box roughly covering Noida/Ghaziabad/Delhi
    const fetchRealData = async () => {
        // Query for Police (amenity=police) and Hospitals (amenity=hospital)
        // BBox: South,West,North,East
        const query = `
            [out:json];
            (
              node["amenity"="police"](28.5,77.1,28.8,77.5);
              node["amenity"="hospital"](28.5,77.1,28.8,77.5);
            );
            out body;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        try {
            console.log("Fetching real map data...");
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.elements) {
                let policeCount = 0;
                let hospitalCount = 0;
                const MAX_ITEMS = 5; // Reduced from displaying all to just 5 of each to save performance

                data.elements.forEach(el => {
                    const type = el.tags.amenity;

                    // Filter limits
                    if (type === 'police' && policeCount >= MAX_ITEMS) return;
                    if (type === 'hospital' && hospitalCount >= MAX_ITEMS) return;

                    if (el.lat && el.lon) {
                        const name = el.tags.name || (type === 'police' ? 'Police Station' : 'Hospital');

                        L.marker([el.lat, el.lon], { icon: safePointIcon(type) })
                            .bindPopup(`<b>${name}</b><br><span style="text-transform: capitalize;">${type}</span>`)
                            .addTo(safeLayer);

                        if (type === 'police') policeCount++;
                        if (type === 'hospital') hospitalCount++;
                    }
                });
                console.log(`Fetched and rendered ${policeCount} Police Stations and ${hospitalCount} Hospitals.`);
            }
        } catch (error) {
            console.warn("Error fetching real map data:", error);
        }
    };

    // Trigger Fetch
    fetchRealData();


    function renderHazards(enabledTypes) {
        hazardLayer.clearLayers();
        HAZARDS.forEach(hazard => {
            if (enabledTypes.length === 0 || enabledTypes.includes(hazard.type)) {
                L.marker([hazard.lat, hazard.lng], { icon: hazardIcon(hazard.type) })
                    .bindPopup(`<b>${hazard.title}</b><br>Type: ${hazard.type.replace('_', ' ')}`)
                    .addTo(hazardLayer);
            }
        });
    }

    // Filter Logic
    const toggles = document.querySelectorAll('.hazard-toggle');
    function getActiveFilters() {
        return Array.from(toggles).filter(cb => cb.checked).map(cb => cb.value);
    }

    toggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            renderHazards(getActiveFilters());
        });
    });

    renderHazards(getActiveFilters());

    // Real-Time Location Logic
    const userLat = sessionStorage.getItem('userLat');
    const userLng = sessionStorage.getItem('userLng');

    if (userLat && userLng) {
        const lat = parseFloat(userLat);
        const lng = parseFloat(userLng);

        userMarker = L.marker([lat, lng], {
            icon: L.divIcon({ className: 'user-marker-pulse', iconSize: [20, 20] })
        }).addTo(map);

        navigator.geolocation.watchPosition((pos) => {
            userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
        });
    }

    // --- DRIVER.JS TOUR ---
    const driver = window.driver.js.driver;
    const mapTour = driver({
        showProgress: true,
        steps: [
            { element: '#map', popover: { title: 'Interactive Map', description: 'Zoom in to see Police Stations, Hospitals, and Safe Zones.' } },
            { element: '.map-controls', popover: { title: 'Filters', description: 'Toggle hazards to see different route options.' } }
        ]
    });

    if (document.getElementById('map-tour-btn')) {
        document.getElementById('map-tour-btn').addEventListener('click', () => mapTour.drive());
    }

    if (!localStorage.getItem('mapTourSeen')) {
        setTimeout(() => { mapTour.drive(); localStorage.setItem('mapTourSeen', 'true'); }, 1000);
    }
});
