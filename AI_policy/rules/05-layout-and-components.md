# 05. LAYOUT AND COMPONENTS

## LAYOUT SYSTEM
- Avoid "everything centered" designs for application pages.
- Standard Layout: `Fixed Sidebar + Top Header + Main Content`.
- Application pages must have a Sidebar and Main Workspace (1-3 columns/panels depending on page).

## CARD SYSTEM
- `background: #FFFFFF`
- `border: 1px solid #9CAC54`
- `rounded-none`
- No huge border-radius, heavy shadow, or glass effect by default.

## BUTTON SYSTEM
- **Primary**: `background: #345C32`, `text: #FFFFFF`, `rounded-full`
- **Accent CTA**: `background: #A7F0DD`, `text: #345C32`, `rounded-full`
- **Secondary**: `border: 1px solid #345C32`, `text: #345C32`, `background: transparent`, `rounded-full`
- **Ghost**: `transparent`, `text: #345C32`, `rounded-full`
- NO gradient buttons.

## INPUT SYSTEM
- `background: #FFFFFF`
- `border: 1px solid #9CAC54`
- `rounded-none`
- **Focus**: `#345C32` border/indicator.
- Do not use capsule/pill shape for inputs unless absolutely necessary.

## MODAL SYSTEM
- Modals are for Edit, Confirmation, Configuration.
- Visuals: White, Square / restrained radius, clear hierarchy, subtle overlay.
- MUST have: Title, Content, Primary action, Secondary action, Close.
- Do not turn modals into floating glass panels.

## COMPONENT DESIGN
- Components must have clear, single responsibilities.
- Do not create massive components containing all page logic if they can be reasonably split.
