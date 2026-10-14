# 01. ARCHITECTURE

## CURRENT ARCHITECTURE
Based on the `src/` directory, this project follows a **Feature-Sliced Design (FSD)** architecture:
- `app/`
- `entities/`
- `features/`
- `pages/`
- `shared/`
- `mocks/`
- `i18n/`
- `styles/`

## RULE
- DO NOT invent or enforce a new architecture (e.g. converting to standard MVC or another structure).
- Extend the existing architecture.
- Store components, hooks, utils, and layouts in their appropriate FSD layers.
