# Tripper

Mobile-first trip planner — build day-by-day itineraries with travel times, opening-hours checks, meal placeholders, nearby suggestions, and a map view. Built on OpenStreetMap.

## Monorepo layout

- `frontend/` — Vite + React 19 PWA
- `backend/` — Express API
- `shared/` — shared TypeScript types (`@tripper/shared`)

## Prerequisites

- Node 22+
- pnpm (via `corepack enable`)

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm --filter @tripper/frontend dev   # http://localhost:5173
pnpm --filter @tripper/backend dev    # http://localhost:3001
```

## Quality gate (run before every commit)

```bash
pnpm run check   # lint + format + typecheck + tests
```

## Tech stack

React 19, TypeScript, Vite, Express 5, pnpm workspaces, Jest + React Testing Library, ESLint, Prettier, vite-plugin-pwa.
