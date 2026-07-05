# Folder Structure

## Tree

```
src/
├── app/                # App shell: App.tsx, providers/, router/
├── pages/              # Route-level components (THIN — compose features)
├── features/           # Vertical slices: auth, coaching, ...
├── entities/           # Domain types: user, plan, ...
├── shared/             # Cross-cutting: api/, ui/, hooks/, lib/, config/
├── i18n/               # i18next + locales/{en,vi}/*.json
├── mocks/              # MSW handlers + browser.ts
├── styles/             # Tailwind globals
├── test/               # Vitest setup
└── main.tsx            # Bootstrap
```

## Where does new code go?

| I want to add...                                          | Folder                              |
| --------------------------------------------------------- | ----------------------------------- |
| A new UI button / card / input                           | `src/shared/ui/<Name>/`             |
| A new cross-cutting hook (theme, debounce)                | `src/shared/hooks/`                 |
| A new env var                                             | `src/shared/config/env.ts`          |
| A new API URL                                             | `src/shared/api/endpoints.ts`       |
| A new domain type                                         | `src/entities/<name>/types.ts`      |
| A new feature slice (e.g., wearable)                      | `src/features/<name>/`              |
| A new React Query hook                                    | `src/features/<name>/model/`        |
| A new page route                                          | `src/pages/<role>/<area>/`          |
| A new form                                                | `src/features/<name>/ui/<Form>.tsx` |
| A new MSW handler                                         | `src/mocks/handlers/`               |
| A new translation string                                  | `src/i18n/locales/{en,vi}/*.json`   |

## Naming

- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Stores: `use*Store.ts`
- Utilities: `camelCase.ts`
- UI primitives folder: `src/shared/ui/<Name>/<Name>.tsx` + `index.ts`
- Feature internals: `<name>Api.ts`, `use<Name>.ts`, `<Name>.tsx`

## Forbidden patterns

- ❌ `import from '@/features/coaching/ui/PlanCard'` — go through the feature's `index.ts` barrel.
- ❌ React components in `entities/`.
- ❌ Business logic in `shared/`.
- ❌ Inline URL strings (always `ENDPOINTS.*`).
- ❌ `useEffect` for data fetching (use TanStack Query).
- ❌ Server data copied into Zustand.