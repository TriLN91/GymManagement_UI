# 09. CODE QUALITY

## GENERAL
- Code must be Readable, Maintainable, Reusable, Consistent, Predictable.
- Name components, variables, functions, routes, and files descriptively.
- DO NOT use names like `Component1`, `PageNew`, `TestPage`, `FinalPage`.

## PERFORMANCE
- Avoid unnecessary re-renders.
- Avoid huge monolithic components.
- Do not duplicate state or API calls.
- Prioritize reuse, composition, clear state ownership, and memoization (only when truly needed). Do not over-engineer.

## RESPONSIVENESS
- Must handle Desktop, Laptop, and Tablet.
- Desktop-first for Trainer UI, but not restricted to a single resolution.
- Do not design Mobile unless explicitly required.

## DATA RULE
- DO NOT fake data randomly or absurdly.
- Mock data in `mocks/`, `fixtures/`, `constants/`, or `services/` based on architecture.
- Data must reflect the fitness domain (Member, Trainer, Gym, Workout, Exercise, Sets, PT Package, etc.).

## STATE RULE
- Important pages MUST handle all states: Loading, Success, Empty, Error, Disabled, Active, Selected, Hover, Focus, Editing, Saving, Saved, Unsaved changes.
- Do not just design the happy path.

## FORM RULE
- Forms must include: Label, Input, Validation, Error state, Required indication, Save, Cancel.
- Keep validation structured.

## ACCESSIBILITY & ICONS
- Use semantic HTML, keyboard navigation, visible focus, ARIA tags, sufficient contrast.
- No icon-only buttons without accessible labels.
- Stick to the existing icon system (e.g. Lucide). Do not mix multiple icon libraries.
