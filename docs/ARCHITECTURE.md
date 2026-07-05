# Architecture Decisions

This document captures the binding architectural decisions for the AI Fitness Coaching frontend.

## 1. Feature-Sliced Design (FSD)

We chose FSD over atomic design or DDD folders because:

- Vertical slices match SRS modules 1-to-1 (`features/auth` ↔ IAM, `features/coaching` ↔ AI Coaching).
- One-way dependency rules (`pages → features → entities → shared`) prevent circular imports at the structural level.
- The layers map naturally to code review boundaries: one PR per feature slice.

## 2. Zustand + TanStack Query (not Redux Toolkit)

- Server data lives in TanStack Query (caching, refetching, deduplication).
- Client-only state (auth user, theme, locale, UI flags) lives in Zustand stores.
- Redux Toolkit would force a single global store for both concerns and add boilerplate that TanStack Query already solves for server data.

## 3. shadcn-style primitives (not MUI, not Ant)

- Tailwind + Radix primitives keep bundle small (≈ 30 KB before app code vs. MUI ≈ 300 KB).
- Per-tenant branding via CSS variables can swap the theme at runtime — design intent for FR-ADM-08.

## 4. react-i18next (not next-intl)

- We do not use Next.js; `next-intl` adds framework assumptions we would pay for in unused code.
- `react-i18next` is the canonical i18n solution for Vite + React.

## 5. MSW over a real backend in Phase 1

- MSW intercepts fetch/axios at the network layer, so the rest of the app is unaware.
- We ship handlers for auth, coaching, etc. and swap them for a real API later by removing the MSW worker registration in `main.tsx`.

## 6. Per-tenant theming — design intent only

- CSS variables on `:root` / `.dark` are the theming primitives today.
- A future prompt will add a runtime theme-injection step that reads tenant branding tokens and overrides the variables.

## Layer rules (one-way)

```
app → pages → features → entities → shared
```

Reverse imports are architectural violations and must be lifted to a lower layer.

## State placement

| Data shape            | Where it lives        | Tool            |
| --------------------- | --------------------- | --------------- |
| Auth user, tenant     | Client                | Zustand         |
| Server data           | Server cache          | TanStack Query  |
| Form values / errors  | Form-local            | React Hook Form |
| URL filters           | URL                   | useSearchParams |
| Cross-feature state   | Avoid — lift to shared | Zustand store   |

## Multi-tenancy

Every request sends `X-Tenant-Id` automatically via the Axios interceptor in
`src/shared/api/client.ts`. Callers must never set this header manually. SSR-DP-05
(data isolation) is enforced at the API layer; the frontend contract is to send the
header on every call.