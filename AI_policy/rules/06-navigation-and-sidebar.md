# 06. NAVIGATION AND SIDEBAR

## SIDEBAR SYSTEM
- Sidebar must be consistent across the entire application.
- DO NOT create custom/separate sidebars for each page.
- Trainer Example structure: Dashboard, Members, Member Data, Workout Builder (collapsible with Exercise Library, Plan Builder, Member's Current Workout), Appointments, Coaching History, Income & PT Packages, Profile.

## WORKOUT BUILDER SIDEBAR RULE
- "Workout Builder" is a submenu in the sidebar.
- When active, it expands to show: Exercise Library, Plan Builder, Member's Current Workout.
- Active child state: `background: #A7F0DD`, `text: #345C32`, `font-weight: bold`, `rounded-full`.
- DO NOT create duplicate top navigation tabs if the sidebar already handles this navigation.

## NAVIGATION RULE
- Do not create multiple navigation patterns for the same module. Keep it consistent.
