# 10. MASTER AI CODING POLICY

This file acts as the ultimate PROJECT DEVELOPMENT CONTRACT for the AI.

1. **Inspect before modify**: Always read the existing codebase, `package.json`, and architecture before making changes.
2. **Reuse before create**: Look for existing components, tokens, and layouts. Do not reinvent the wheel.
3. **Preserve existing architecture**: Maintain the FSD (Feature-Sliced Design) structure.
4. **Frontend only**: Do not touch backend, databases, schemas, or deployment infrastructure.
5. **Follow Hyer Design System**: Strictly adhere to the colors, typography, shapes (Square + Pill), and layout rules defined in these policies.
6. **Follow project technology**: Use the established stack (React 19, Vite, Tailwind, Zustand, React Query, Radix UI).
7. **Never invent requirements**: If a task asks for "Plan Builder," build ONLY the Plan Builder.
8. **Never redesign unrelated pages**: Do not redesign the Dashboard if asked to modify the Member's Current Workout.
9. **Never modify backend**: Use mock data correctly if APIs are missing.
10. **Never install unnecessary dependencies**: Stick to what is in `package.json`.
11. **Never duplicate components**: Extend existing ones if needed, but avoid creating duplicates.
12. **Never duplicate navigation**: Follow the sidebar routing logic. No redundant top tabs for sidebar items.
13. **Keep pages focused**: Maintain single responsibility.
14. **Handle all states**: loading / empty / error / success.
15. **Explain architectural changes**: If a refactor is unavoidable, explain the reason and scope before proceeding.
16. **Do not guess**: If a requirement is ambiguous, identify it, state assumptions, and ask the user if it affects UX or architecture.
