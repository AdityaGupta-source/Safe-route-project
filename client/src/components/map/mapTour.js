import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/** Guided walkthrough of the map's filters and data sources. */
export function createMapTour() {
  return driver({
    showProgress: true,
    steps: [
      {
        element: '#map',
        popover: {
          title: '🗺️ Interactive Safety Map',
          description:
            'Welcome to the Safe Route Map! You can see two paths: the <span style="color: #ef4444;">red unsafe route</span> and the <span style="color: #10b981;">green safe route</span>. Click on either path to view detailed statistics.',
          side: 'left',
          align: 'start',
        },
      },
      {
        element: '#map-controls',
        popover: {
          title: '⚙️ Route Filters Panel',
          description:
            'This powerful control panel lets you customize exactly what you see on the map. Filters are organized into two sections for easy management.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#hazards-toggles',
        popover: {
          title: '⚠️ Hazard Filters',
          description:
            'Toggle Construction, Sewage, Broken Lights, and Roads on/off. Uncheck any to hide those hazard markers from the map!',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#safe-zones-toggles',
        popover: {
          title: '🛡️ Safe Zone Filters',
          description:
            '<strong>Police Stations</strong> 🔵 • <strong>Hospitals</strong> 🔴 • <strong>Coffee Shops & Safe Spots</strong> 🟢<br>Toggle to show/hide!',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        popover: {
          title: '☕ Real-Time Safety Data',
          description:
            'Coffee shops and safe zones are perfect rest stops! Police stations and hospitals are fetched live from OpenStreetMap for accurate locations.',
          side: 'center',
          align: 'center',
        },
      },
      {
        popover: {
          title: '🚀 Start Exploring!',
          description:
            'Use the filters to customize your view and always choose the safest route. Stay safe! 🛡️✨',
          side: 'center',
          align: 'center',
        },
      },
    ],
  });
}
