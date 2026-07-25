# Safe Route

Personalized navigation that prioritizes safety over shortcuts.

The product brief lives in [docs/requirement.md](docs/requirement.md); the system design
lives in [docs/design.md](docs/design.md).

## Repository layout

```
.
├── client/          React + Vite frontend (Tailwind CSS)
├── server/          Express + Prisma backend (skeleton only)
└── docs/            Product and design documentation
```

## Frontend (`client/`)

```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173.

| Command           | Purpose                        |
| ----------------- | ------------------------------ |
| `npm run dev`     | Dev server with hot reload     |
| `npm run build`   | Production build into `dist/`  |
| `npm run preview` | Serve the production build     |

### Structure

```
client/src/
├── assets/          Images
├── components/
│   ├── contacts/    Trusted-contact card and form dialog
│   ├── home/        Landing page sections
│   ├── layout/      Navbar, Sidebar, PageLayout, ScrollManager
│   ├── map/         Leaflet icons, filter panel, trip stats, tour
│   └── ui/          Shared dialogs
├── context/         ToastProvider, ConfirmProvider
├── data/            Route geometry, hazards, seed content
├── hooks/           useSidebar, useGsapFadeIn, useSafeRouteMap
├── pages/           One component per route
├── routes/          Route table
├── services/        localStorage wrapper, Overpass API client
└── index.css        Tailwind entry + design tokens
```

### Styling

Tailwind CSS. The design tokens (colours, fonts, shadows, keyframes) are defined in
[client/tailwind.config.js](client/tailwind.config.js).

Two things to know before editing styles:

- **Breakpoints are custom.** They are set to `481 / 769 / 1025px` so the original
  `max-width` media queries map onto Tailwind's mobile-first prefixes exactly. `md:`
  means "769px and up", not Tailwind's usual 768.
- **Heading sizes are restored in `@layer base`.** Tailwind's preflight removes them,
  and much of the layout relies on default `h2`/`h3` sizing.

Reusable patterns (`.glass`, `.btn`, `.app-container`, `.toast`, `.modal`) live in
`@layer components` in `index.css`. Everything else is utility classes in the JSX.

## Backend (`server/`)

Structure only — the source files are intentionally empty.

```bash
cd server
npm install
```

```
server/
├── prisma/          schema.prisma
├── src/
│   ├── config/      env, database, logger
│   ├── routes/      HTTP route definitions
│   ├── controllers/ Request handlers
│   ├── services/    Business logic (routing, safety scoring, hazards)
│   ├── middleware/  auth, validation, error handling
│   ├── models/      Data access
│   ├── validators/  Request schemas
│   └── utils/
└── tests/
```

## Notes

- Data is currently browser-local: saved routes and trusted contacts persist to
  `localStorage`, and the route planner passes its start/destination through
  `sessionStorage`. Wiring these to the backend is the natural next step.
- Police stations and hospitals on the map are fetched live from the OpenStreetMap
  Overpass API; everything else is bundled seed data in `client/src/data/`.
