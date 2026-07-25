// Single source of truth for the slide-out sidebar menu.
export const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/#features', icon: 'fa-layer-group', label: 'Features', hash: true },
      { to: '/map', icon: 'fa-map-location-dot', label: 'Live Map' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/profile', icon: 'fa-user', label: 'My Profile' },
      { to: '/history', icon: 'fa-clock-rotate-left', label: 'Ride History' },
      { to: '/saved-places', icon: 'fa-heart', label: 'Saved Places' },
      { to: '/notifications', icon: 'fa-bell', label: 'Notifications', badge: 2 },
    ],
  },
  {
    label: 'Safety',
    items: [
      { to: '/sos', icon: 'fa-triangle-exclamation', label: 'Emergency SOS', danger: true },
      { to: '/contacts', icon: 'fa-user-shield', label: 'Trusted Contacts' },
    ],
  },
];
