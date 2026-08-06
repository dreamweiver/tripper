# Tripper — Scaffold & Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Tripper monorepo skeleton — pnpm workspaces with `frontend/` (Vite + React 19 + TS PWA), `backend/` (Express + TS), and `shared/` (shared types) — with linting, formatting, type-checking, and unit tests all wired and passing.

**Architecture:** pnpm-workspace monorepo. `shared/` exports TypeScript types consumed by both `frontend` and `backend` via `@tripper/shared`. Each package has its own tuned `tsconfig`. Root holds workspace config + shared dev tooling (ESLint, Prettier). This plan produces a running app shell + a running API health endpoint, both lint/typecheck/test green — the foundation every later subsystem builds on. No business logic yet.

**Tech Stack:** pnpm workspaces, React 19.2.x, Vite, TypeScript (strict), ESLint, Prettier, Jest + React Testing Library (frontend), Jest + ts-jest (backend), vite-plugin-pwa, Express 5.

**Branch:** `feature/scaffold-tooling`

**Prerequisites:** Node 22.x, corepack enabled (`corepack enable`). Work in the existing repo at repo root; `main` already has LICENSE + docs. Do NOT commit to main — all work on `feature/scaffold-tooling`. Do NOT push or open PR without user approval.

---

## File Structure

```
tripper/
├── package.json                 # workspace root: scripts, shared devDeps
├── pnpm-workspace.yaml          # declares frontend/backend/shared packages
├── .npmrc                       # pnpm settings
├── .prettierrc.json             # shared Prettier config
├── .prettierignore
├── eslint.config.mjs            # shared flat ESLint config (root)
├── tsconfig.base.json           # shared strict TS base, extended per package
├── .gitignore                   # (exists — extend)
├── shared/
│   ├── package.json             # @tripper/shared
│   ├── tsconfig.json
│   ├── jest.config.ts
│   └── src/
│       ├── index.ts             # re-exports
│       ├── types.ts             # placeholder shared type
│       └── types.test.ts
├── frontend/
│   ├── package.json
│   ├── tsconfig.json            # browser/JSX
│   ├── vite.config.ts           # Vite + PWA plugin
│   ├── jest.config.ts
│   ├── jest.setup.ts            # RTL matchers
│   ├── index.html
│   └── src/
│       ├── main.tsx             # React 19 entry
│       ├── App.tsx              # minimal shell
│       └── App.test.tsx
└── backend/
    ├── package.json
    ├── tsconfig.json            # Node
    ├── jest.config.ts
    └── src/
        ├── index.ts             # Express bootstrap
        ├── app.ts               # Express app factory (testable)
        └── app.test.ts          # health endpoint test
```

---

## Task 1: Create the feature branch

**Files:** none (git only)

- [ ] **Step 1: Create and switch to the feature branch**

Run:
```bash
git checkout -b feature/scaffold-tooling
```
Expected: `Switched to a new branch 'feature/scaffold-tooling'`

- [ ] **Step 2: Confirm branch**

Run: `git branch --show-current`
Expected: `feature/scaffold-tooling`

---

## Task 2: Enable pnpm and initialize workspace root

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `package.json` (root)

- [ ] **Step 1: Enable pnpm via corepack**

Run:
```bash
corepack enable && corepack prepare pnpm@latest --activate && pnpm -v
```
Expected: prints a pnpm version (e.g. `9.x`).

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "shared"
  - "frontend"
  - "backend"
```

- [ ] **Step 3: Create `.npmrc`**

```
# Stricter isolation: packages can only import declared deps
shamefully-hoist=false
# Deterministic, CI-friendly installs
prefer-workspace-packages=true
```

- [ ] **Step 4: Create root `package.json`**

```json
{
  "name": "tripper",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": { "node": ">=22" },
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --check .",
    "format:write": "prettier --write .",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "check": "pnpm lint && pnpm format && pnpm typecheck && pnpm test"
  },
  "devDependencies": {
    "prettier": "^3.4.2",
    "eslint": "^9.17.0",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.19.0",
    "@eslint/js": "^9.17.0"
  }
}
```

- [ ] **Step 5: Install root dev deps**

Run: `pnpm install`
Expected: completes without error; creates `pnpm-lock.yaml` and `node_modules/`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml .npmrc pnpm-lock.yaml
git commit -m "chore: initialize pnpm workspace root"
```

---

## Task 3: Shared TypeScript base config

**Files:**
- Create: `tsconfig.base.json`

- [ ] **Step 1: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.base.json
git commit -m "chore: add shared strict tsconfig base"
```

---

## Task 4: Shared package with a typed unit + passing test

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/jest.config.ts`
- Create: `shared/src/types.ts`
- Create: `shared/src/index.ts`
- Test: `shared/src/types.test.ts`

- [ ] **Step 1: Create `shared/package.json`**

```json
{
  "name": "@tripper/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-vm-modules ../node_modules/jest/bin/jest.js"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5"
  }
}
```

- [ ] **Step 2: Create `shared/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `shared/jest.config.ts`**

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};

export default config;
```

- [ ] **Step 4: Write the failing test**

`shared/src/types.test.ts`:
```ts
import { isMealKind } from "./index.js";

// Business logic: event "kind" discriminates places from meals; used app-wide.
test("isMealKind identifies meal events", () => {
  expect(isMealKind("meal")).toBe(true);
  expect(isMealKind("place")).toBe(false);
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm --filter @tripper/shared test`
Expected: FAIL — `isMealKind` not exported / module not found.

- [ ] **Step 6: Write minimal implementation**

`shared/src/types.ts`:
```ts
// Core discriminant for itinerary items — kept in shared so FE + BE agree.
export type EventKind = "place" | "meal" | "suggestion_accepted";

export function isMealKind(kind: EventKind): boolean {
  return kind === "meal";
}
```

`shared/src/index.ts`:
```ts
export * from "./types.js";
```

- [ ] **Step 7: Install shared deps**

Run: `pnpm install`
Expected: resolves `@tripper/shared` devDeps.

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter @tripper/shared test`
Expected: PASS (1 test).

- [ ] **Step 9: Run typecheck**

Run: `pnpm --filter @tripper/shared typecheck`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add shared pnpm-lock.yaml
git commit -m "feat(shared): add EventKind type + isMealKind with test"
```

---

## Task 5: Backend package — Express app factory + health endpoint (TDD)

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/jest.config.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/index.ts`
- Test: `backend/src/app.test.ts`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "@tripper/backend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-vm-modules ../node_modules/jest/bin/jest.js"
  },
  "dependencies": {
    "@tripper/shared": "workspace:*",
    "express": "^5.0.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.14",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "tsx": "^4.19.2"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node", "jest"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `backend/jest.config.ts`**

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};

export default config;
```

- [ ] **Step 4: Write the failing test**

`backend/src/app.test.ts`:
```ts
import request from "supertest";
import { createApp } from "./app.js";

test("GET /health returns ok status", async () => {
  const res = await request(createApp()).get("/health");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: "ok" });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `pnpm --filter @tripper/backend test`
Expected: FAIL — cannot find `./app.js` / `createApp`.

- [ ] **Step 6: Write minimal implementation**

`backend/src/app.ts`:
```ts
import express, { type Express } from "express";

// App factory (not a running server) so tests can mount it without a port.
export function createApp(): Express {
  const app = express();
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  return app;
}
```

`backend/src/index.ts`:
```ts
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
createApp().listen(port, () => {
  console.log(`Tripper API listening on :${port}`);
});
```

- [ ] **Step 7: Install backend deps**

Run: `pnpm install`
Expected: resolves Express + test deps.

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter @tripper/backend test`
Expected: PASS (1 test).

- [ ] **Step 9: Typecheck**

Run: `pnpm --filter @tripper/backend typecheck`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add backend pnpm-lock.yaml
git commit -m "feat(backend): Express app factory with /health endpoint"
```

---

## Task 6: Frontend package — Vite + React 19 + TS

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "@tripper/frontend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@tripper/shared": "workspace:*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/jest": "^29.5.14",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.2.5",
    "vite": "^6.0.5"
  }
}
```

- [ ] **Step 2: Create `frontend/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": ["node", "jest", "@testing-library/jest-dom"],
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `frontend/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

- [ ] **Step 4: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tripper</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `frontend/src/App.tsx`**

```tsx
export default function App() {
  return <h1>Tripper</h1>;
}
```

- [ ] **Step 6: Create `frontend/src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 7: Install frontend deps**

Run: `pnpm install`
Expected: resolves React 19 + Vite + test deps.

- [ ] **Step 8: Verify dev server boots**

Run: `pnpm --filter @tripper/frontend dev` (then Ctrl-C after it prints the local URL)
Expected: Vite prints `Local: http://localhost:5173/` with no errors.

- [ ] **Step 9: Verify build + typecheck**

Run: `pnpm --filter @tripper/frontend build`
Expected: build succeeds, emits `dist/`.

- [ ] **Step 10: Commit**

```bash
git add frontend pnpm-lock.yaml
git commit -m "feat(frontend): Vite + React 19 + TS app shell"
```

---

## Task 7: Frontend unit test with React Testing Library (TDD)

**Files:**
- Create: `frontend/jest.config.ts`
- Create: `frontend/jest.setup.ts`
- Test: `frontend/src/App.test.tsx`

- [ ] **Step 1: Create `frontend/jest.config.ts`**

```ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@tripper/shared$": "<rootDir>/../shared/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

export default config;
```

- [ ] **Step 2: Create `frontend/jest.setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Write the failing test**

`frontend/src/App.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import App from "./App.js";

test("renders the Tripper heading", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /tripper/i })).toBeInTheDocument();
});
```

- [ ] **Step 4: Run test to verify it passes** (App already renders the heading)

Run: `pnpm --filter @tripper/frontend test`
Expected: PASS (1 test). If it fails on config, fix jest.config before proceeding.

- [ ] **Step 5: Verify the test genuinely asserts** — temporarily change `App.tsx` heading to `Nope`, rerun, confirm FAIL, then revert to `Tripper` and confirm PASS again.

Run: `pnpm --filter @tripper/frontend test`
Expected: FAIL when changed, PASS after revert.

- [ ] **Step 6: Commit**

```bash
git add frontend
git commit -m "test(frontend): App renders heading (RTL + jsdom)"
```

---

## Task 8: Shared ESLint (flat config) + Prettier

**Files:**
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Install ESLint plugins for React at root**

Run:
```bash
pnpm add -Dw eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```
Expected: added to root devDependencies.

- [ ] **Step 2: Create `eslint.config.mjs`**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "**/coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["frontend/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: { globals: { ...globals.browser } },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    files: ["backend/**/*.ts", "shared/**/*.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
);
```

- [ ] **Step 3: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 4: Create `.prettierignore`**

```
**/dist
**/coverage
pnpm-lock.yaml
docs/superpowers
.superpowers
```

- [ ] **Step 5: Add `typecheck` script to shared** (frontend/backend already have it; shared has it from Task 4). Verify all three packages expose `typecheck`.

Run: `pnpm -r typecheck`
Expected: all packages typecheck with no errors.

- [ ] **Step 6: Auto-format the repo**

Run: `pnpm run format:write`
Expected: rewrites files to Prettier style.

- [ ] **Step 7: Run the full check suite**

Run: `pnpm run check`
Expected: lint ✓, format ✓, typecheck ✓, tests ✓ (3 test suites pass across packages).

- [ ] **Step 8: Commit**

```bash
git add eslint.config.mjs .prettierrc.json .prettierignore package.json pnpm-lock.yaml
git commit -m "chore: add shared ESLint flat config + Prettier"
```

---

## Task 9: PWA shell (installable + service worker)

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package.json` (add dep)
- Create: `frontend/public/manifest` handled by plugin (no manual file)

- [ ] **Step 1: Add the PWA plugin**

Run:
```bash
pnpm --filter @tripper/frontend add -D vite-plugin-pwa
```
Expected: added to frontend devDependencies.

- [ ] **Step 2: Update `frontend/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Tripper",
        short_name: "Tripper",
        description: "Mobile-first trip planner",
        theme_color: "#2d6cdf",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
      },
    }),
  ],
  server: { port: 5173 },
});
```

- [ ] **Step 3: Verify build produces a service worker + manifest**

Run: `pnpm --filter @tripper/frontend build`
Expected: build output lists `sw.js` and `manifest.webmanifest` in `dist/`.

- [ ] **Step 4: Run full check suite**

Run: `pnpm run check`
Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add frontend pnpm-lock.yaml
git commit -m "feat(frontend): add PWA manifest + service worker (installable)"
```

---

## Task 10: Extend .gitignore and add README

**Files:**
- Modify: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Ensure `.gitignore` covers monorepo outputs** — final contents:

```
node_modules/
.superpowers/
.env
.env.local
**/dist/
**/coverage/
*.log
.DS_Store
dev-dist/
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
```

- [ ] **Step 3: Verify check suite still green**

Run: `pnpm run check`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add .gitignore README.md
git commit -m "docs: add README and extend .gitignore for monorepo"
```

---

## Task 11: Final verification (whole workspace)

**Files:** none

- [ ] **Step 1: Clean install from scratch**

Run: `rm -rf node_modules **/node_modules && pnpm install`
Expected: clean install succeeds.

- [ ] **Step 2: Full quality gate**

Run: `pnpm run check`
Expected: lint ✓, format ✓, typecheck ✓, all tests ✓.

- [ ] **Step 3: Frontend builds**

Run: `pnpm --filter @tripper/frontend build`
Expected: succeeds with PWA assets.

- [ ] **Step 4: Backend builds**

Run: `pnpm --filter @tripper/backend build`
Expected: succeeds, emits `backend/dist/`.

- [ ] **Step 5: STOP — request user approval before push/PR**

Do NOT push or open a PR. Report to the user that `feature/scaffold-tooling` is ready, summarize what was built and that all checks pass, and wait for explicit approval to push.

---

## Notes for the implementer

- **Never commit to `main`.** All commits land on `feature/scaffold-tooling`.
- **No push / no PR without explicit user approval.** The user opens PRs and merges.
- Run `pnpm run check` before every commit; do not commit if any part fails.
- ESM everywhere (`"type": "module"`); use `.js` extensions in relative TS imports where NodeNext resolution requires it (backend).
- If a pinned version is unavailable, install the nearest current stable and note the change for the user rather than downgrading tooling.
- This plan intentionally contains **no app business logic** — it is the foundation. Trip CRUD, timeline, map, and providers come in later plans.
