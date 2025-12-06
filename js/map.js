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
        let iconClass = 'fa-triangle-exclamation';
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
        let color = '#10b981';

        if (type === 'shop') iconClass = 'fa-mug-hot';
        if (type === 'police') { iconClass = 'fa-building-shield'; color = '#3b82f6'; }
        if (type === 'hospital') { iconClass = 'fa-hospital'; color = '#ef4444'; }
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

    // Polylines
    const standardPoly = L.polyline(STANDARD_PATH, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.7
    }).addTo(map);

    const hazardList = HAZARDS.filter(h => !['Unlit Alley', 'Sewer Leakage', 'Damaged Pavement'].includes(h.title))
        .map(h => `<li>${h.title} (${h.type.replace('_', ' ')})</li>`).slice(0, 5).join('');

    standardPoly.bindPopup(`
        <div style="text-align: center;">
            <h3 style="color: #ef4444; margin: 0 0 5px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Unsafe Route</h3>
            <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">This route contains reported hazards</p>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 0.75rem 0; padding: 0.5rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                <div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">38 min</div>
                    <div style="font-size: 0.7rem; opacity: 0.7;">Est. Time</div>
                </div>
                <div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">62%</div>
                    <div style="font-size: 0.7rem; opacity: 0.7;">Safety Score</div>
                </div>
                <div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">19.5 km</div>
                    <div style="font-size: 0.7rem; opacity: 0.7;">Distance</div>
                </div>
            </div>
            
            <div style="text-align: left; margin-top: 0.5rem;">
                <strong style="font-size: 0.85rem;">Hazards on route:</strong>
                <ul style="font-size: 0.85em; padding-left: 20px; margin: 5px 0;">${hazardList}</ul>
            </div>
        </div>
    `);

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

    // Store fetched safe points globally for filtering
    let fetchedSafePoints = [];

    // Fetch REAL Data from Overpass API
    const fetchRealData = async () => {
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
                const MAX_ITEMS = 5;

                data.elements.forEach(el => {
                    const type = el.tags.amenity;
                    if (type === 'police' && policeCount >= MAX_ITEMS) return;
                    if (type === 'hospital' && hospitalCount >= MAX_ITEMS) return;

                    if (el.lat && el.lon) {
                        const name = el.tags.name || (type === 'police' ? 'Police Station' : 'Hospital');
                        fetchedSafePoints.push({ lat: el.lat, lng: el.lon, type: type, title: name });

                        if (type === 'police') policeCount++;
                        if (type === 'hospital') hospitalCount++;
                    }
                });

                console.log(`Fetched ${policeCount} Police Stations and ${hospitalCount} Hospitals.`);
                renderSafePoints(); // Render after fetch completes
            }
        } catch (error) {
            console.warn("Error fetching real map data:", error);
        }
    };

    fetchRealData();

    // === HAZARD FILTERING ===
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

    const hazardToggles = document.querySelectorAll('.hazard-toggle');
    function getActiveHazardFilters() {
        return Array.from(hazardToggles).filter(cb => cb.checked).map(cb => cb.value);
    }

    hazardToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            renderHazards(getActiveHazardFilters());
        });
    });

    renderHazards(getActiveHazardFilters());

    // === SAFE ZONE FILTERING ===
    function renderSafePoints() {
        safeLayer.clearLayers();
        const activeSafeFilters = Array.from(safeToggles).filter(cb => cb.checked).map(cb => cb.value);

        // 1. Render Pre-defined Safe Points (shops and safe zones)
        if (SAFE_POINTS && activeSafeFilters.includes('safe_spot')) {
            SAFE_POINTS.forEach(point => {
                L.marker([point.lat, point.lng], { icon: safePointIcon(point.type) })
                    .bindPopup(`<b>${point.title}</b><br>Type: ${point.type === 'shop' ? 'Coffee Shop' : 'Safe Zone'}`)
                    .addTo(safeLayer);
            });
        }

        // 2. Render Fetched Real Data (police and hospitals)
        fetchedSafePoints.forEach(point => {
            if (activeSafeFilters.includes(point.type)) {
                L.marker([point.lat, point.lng], { icon: safePointIcon(point.type) })
                    .bindPopup(`<b>${point.title}</b><br><span style="text-transform: capitalize;">${point.type}</span>`)
                    .addTo(safeLayer);
            }
        });
    }

    const safeToggles = document.querySelectorAll('.safe-toggle');

    safeToggles.forEach(toggle => {
        toggle.addEventListener('change', renderSafePoints);
    });

    renderSafePoints(); // Initial render

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

    // DRIVER.JS TOUR - Comprehensive Feature Walkthrough
    const driver = window.driver.js.driver;
    const mapTour = driver({
        showProgress: true,
        steps: [
            {
                element: '#map',
                popover: {
                    title: '🗺️ Interactive Safety Map',
                    description: 'Welcome to the Safe Route Map! You can see two paths: the <span style="color: #ef4444;">red unsafe route</span> and the <span style="color: #10b981;">green safe route</span>. Click on either path to view detailed statistics.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '.map-controls',
                popover: {
                    title: '⚙️ Route Filters Panel',
                    description: 'This powerful control panel lets you customize exactly what you see on the map. Filters are organized into two sections for easy management.',
                    side: "right",
                    align: 'start'
                }
            },

            {
                element: '#hazards-toggles',
                popover: {
                    title: '⚠️ Hazard Filters',
                    description: 'Toggle Construction, Sewage, Broken Lights, and Roads on/off. Uncheck any to hide those hazard markers from the map!',
                    side: "bottom",
                    align: 'start'
                }
            },

            {
                element: '#safe-zones-toggles',
                popover: {
                    title: '🛡️ Safe Zone Filters',
                    description: '<strong>Police Stations</strong> 🔵 • <strong>Hospitals</strong> 🔴 • <strong>Coffee Shops & Safe Spots</strong> 🟢<br>Toggle to show/hide!',
                    side: "bottom",
                    align: 'start'
                }
            },


            {
                popover: {
                    title: '☕ Real-Time Safety Data',
                    description: 'Coffee shops and safe zones are perfect rest stops! Police stations and hospitals are fetched live from OpenStreetMap for accurate locations.',
                    side: "center",
                    align: 'center'
                }
            },
            {
                popover: {
                    title: '🚀 Start Exploring!',
                    description: 'Use the filters to customize your view and always choose the safest route. Stay safe! 🛡️✨',
                    side: "center",
                    align: 'center'
                }
            }
        ]
    });

    if (document.getElementById('map-tour-btn')) {
        document.getElementById('map-tour-btn').addEventListener('click', () => mapTour.drive());
    }

    if (!localStorage.getItem('mapTourSeen')) {
        setTimeout(() => { mapTour.drive(); localStorage.setItem('mapTourSeen', 'true'); }, 1500);
    }
});
