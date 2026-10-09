# GymManagement_UI

Web frontend for FitFlex (AI fitness coaching and gym management). React 19, TypeScript (strict), Vite, React Router, TanStack Query, Zustand, Tailwind, i18next (vi/en), MSW, Vitest, Playwright.

Portals: Member `/app`, Trainer (PT) `/pt`, Gym Admin `/admin`, Platform Admin `/superadmin`. Role order: Platform Admin > Gym Admin > PT > User.

## Quick start

Use the Node version in `.nvmrc` (22.12.0) so local results match CI (`nvm use` or `fnm use`).

```bash
npm ci
cp .env.example .env.local   # optional, defaults work
npm run dev                  # http://localhost:5173
```

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Dev server. MSW (mock API) is on by default.    |
| `npm run typecheck` | `tsc -b --noEmit`                               |
| `npm run lint`      | ESLint, zero warnings allowed                   |
| `npm run test`      | Vitest unit tests (`*.test.ts(x)` next to code) |
| `npm run e2e`       | Playwright, starts the dev server itself        |
| `npm run build`     | Type-check and production build                 |

## Environment variables

See `.env.example`. All variables are validated in `src/shared/config/env.ts`.

| Variable              | Default                                     | Notes                                                     |
| --------------------- | ------------------------------------------- | --------------------------------------------------------- |
| `VITE_API_BASE_URL`   | `http://localhost:5167/api`                 | Backend base URL (`AI_SEP_FA26_BE`, route prefix `/api`). |
| `VITE_ENABLE_MSW`     | `true` in dev, `false` in production builds | Must be exactly `true` or `false`.                        |
| `VITE_DEFAULT_LOCALE` | `en`                                        | `en` or `vi`.                                             |

## Mock API vs real backend

- **MSW on (default in dev):** every request is answered by `src/mocks/handlers`. Demo accounts (password `Password1!`): `member@demo.gym`, `pt@demo.gym`, `admin@demo.gym`, `super@demo.gym`.
- **MSW off:** set `VITE_ENABLE_MSW=false` and run the backend. Auth (`/api/identity/*`) and the fitness profile sync (`/api/coaching/me/*`) use the real API; the backend must allow the `http://localhost:5173` origin (CORS).
- Most other screens still use local sample data stored in the browser (Zustand + localStorage) and are demos until the backend has matching endpoints. Forgot/reset password and AI coaching are mock-only for now.

## Code layout

Dependencies go one way: `app → pages → features → entities → shared` (enforced by ESLint). Routes, storage keys and query keys live in `src/shared/config/constants.ts`; API URLs in `src/shared/api/endpoints.ts`; HTTP goes through `src/shared/api/client.ts`. More detail: `docs/ARCHITECTURE.md`.

## Contributing

Work on a branch (never push to `main`), keep commit messages short and clear (Conventional Commits, enforced by commitlint), and make sure `typecheck`, `lint`, `test` and `build` pass before opening a PR.
