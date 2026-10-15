# FitFlex Web Design System

**Scope:** `GymManagement_UI`, the React web frontend. This is a source audit of the implementation, not a proposed redesign. Paths below are relative to this repository root. **Verified** means read directly from source; **inferred** means a repeated convention rather than a formal token; **not verified** means runtime behavior or a value was not established. The sibling Expo project `../AI_SEP_FA26_MOBILE` has a separate implementation and is outside this document.

## Contents

1. [Design System Overview](#1-design-system-overview)
2. [Technology and Styling Architecture](#2-technology-and-styling-architecture)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Layout and Spacing System](#5-layout-and-spacing-system)
6. [Header and Navigation](#6-header-and-navigation)
7. [Button System](#7-button-system)
8. [Component Library and UI Patterns](#8-component-library-and-ui-patterns)
9. [Animation and Motion System](#9-animation-and-motion-system)
10. [Forms and Interaction States](#10-forms-and-interaction-states)
11. [Data Visualization and Information Density](#11-data-visualization-and-information-density)
12. [Iconography and Assets](#12-iconography-and-assets)
13. [Responsive Design](#13-responsive-design)
14. [Page Composition Patterns](#14-page-composition-patterns)
15. [Design Consistency Rules](#15-design-consistency-rules)
16. [Implementation Reference Index](#16-implementation-reference-index)
17. [New UI Generation Contract](#17-new-ui-generation-contract-for-other-ai-tools)

## 1. Design System Overview

**Verified identity.** FitFlex uses green brand text and controls, pale green or off-white canvases, white content surfaces, mint selection accents, and lime highlights. The authenticated Member, Trainer, Gym Owner, and Platform Admin shells reuse a common sidebar/topbar CSS structure. The public landing and authentication pages have separate compositions. The primary typeface is Be Vietnam Pro; IBM Plex Mono is assigned to data roles. Evidence: `src/styles/globals.css`, `src/pages/member/components/member-layout.css`, `src/features/landing/ui/landing.css`, and `index.html`.

**Inferred intent.** The repeated compact uppercase labels, dense operational panels, prominent numerals, and thin borders favor quick scanning. This is an interpretation of repeated code, not a formally declared product principle.

**Consistency rule.** Start with the destination role's existing shell and nearest feature page. Reuse `src/shared/ui` where its shape fits, then the feature area's established classes. A shared token does not imply that every page has identical card radius or background. In particular, operational Owner/Admin panels often have square boundaries while marketing, authentication, and some Member cards use rounded forms.

**Audit coverage.** Inspected routing, app entry, global tokens, all shared UI primitives, all four role shells, landing/auth layouts, representative Member workout/marketplace/profile and Trainer workspace pages, Owner dashboard/onboarding/analytics, Platform dashboard/operations, all CSS file locations, and asset inventory. A saved Platform Admin desktop screenshot in the parent workspace was visually reviewed; its capture date and parity with the current code are not verified. Feature CSS outside the cited examples was inventoried for breakpoints and motion, but each selector and every runtime state was not exhaustively verified. No live browser session was run; behavioral observations below are source based.

## 2. Technology and Styling Architecture

| Layer | Verified implementation | Source |
| --- | --- | --- |
| Rendering | React 19 + TypeScript, Vite client app | `package.json`, `src/main.tsx`, `src/app/App.tsx` |
| Routing | React Router; lazy page imports; role guards; `/app`, `/pt`, `/admin`, `/superadmin` portals | `src/app/router/index.tsx`, `src/shared/config/constants.ts` |
| Styling | Tailwind 3 utilities and extended semantic colors, plus global CSS and feature scoped CSS classes | `tailwind.config.ts`, `src/styles/globals.css`, `src/features/**/ui/*.css` |
| Components | Project wrappers around Radix Dialog, Tabs, Label, Slot; native form controls; CVA variants | `src/shared/ui` |
| Icons and feedback | `lucide-react`; Sonner toasts; `tailwindcss-animate` | `package.json`, `src/shared/ui/toast/Toaster.tsx`, `tailwind.config.ts` |
| Theme | `dark` class on document root, `light`/`dark`/`system` preference in local storage | `src/shared/hooks/useTheme.ts`, `src/styles/globals.css` |
| Localization | i18next, English and Vietnamese | `src/i18n/index.ts`, `src/i18n/locales` |

The canonical semantic mapping is CSS custom properties in `src/styles/globals.css` consumed by `tailwind.config.ts`. The authenticated shell has additional local `--member-*` variables in `member-layout.css`. Feature CSS often declares its own aliases or literal colors; preserve the local pattern when extending that feature and avoid exporting local values as universal tokens. `src/shared/ui/workspace/Workspace.tsx` is a reusable page/panel entry point. `PortalLayout.tsx` is an older, distinct generic layout; the role routes use their role layouts in `src/pages/*/components` and `src/pages/superadmin` (verify the route before choosing a shell).

## 3. Color System

Values are the exact source representation. HSL triplets are supplied to `hsl(var(...))`; `--surface` and some accents are complete colors. A color row being present does not mean it is used in every role or in dark mode.

| Token / value | Purpose and usage | Evidence | Status |
| --- | --- | --- | --- |
| `--brand: 117.143 29.577% 27.843%` | `primary`, `forest`, headings/actions via Tailwind | `globals.css`, `tailwind.config.ts` | Verified |
| `--brand-strong: #173917` | Strong heading/hover green | `globals.css`; landing and marketplace local equivalents | Verified |
| `--brand-secondary: #1c6a5b` | Secondary teal accent | `globals.css`; workout local alias | Verified |
| `--canvas: 71 52% 96%` | Pale canvas / accent background | `globals.css`, Tailwind `canvas`, `accent` | Verified |
| `--surface: #ffffff`, `--background: 0 0% 100%`, `--card: 0 0% 100%` | White surfaces | `globals.css` | Verified |
| `--ink: 72 100% 6%`, `--foreground: var(--ink)` | Main text | `globals.css` | Verified |
| `--text-muted: 100 7% 41%`, `--muted-foreground: var(--text-muted)` | Secondary/helper text | `globals.css` | Verified |
| `--outline: 80 16% 82%`, `--border` and `--input: var(--outline)` | Dividers/form borders | `globals.css` | Verified |
| `--mint: #a7f0dd` | Mint accents, chart comparison, shell selected text | `globals.css`, `member-layout.css`, `gym-owner-analytics.css` | Verified |
| `--energy-lime: #e5f796`, `--energy-lime-soft: color-mix(in srgb, var(--energy-lime) 28%, white)`, `--energy-lime-faint: color-mix(in srgb, var(--energy-lime) 14%, white)` | Accent buttons, active tabs, attention panels, selected rows | `globals.css`, shared `Button`, `Tabs`, `Card`, `Table` | Verified |
| `ash: #97CD97`, `pebble: #9CAC54` | Tailwind named accents; table header tint and attention borders | `tailwind.config.ts`, `src/shared/ui/table/Table.tsx`, `globals.css` | Verified |
| `--destructive: 0 84.2% 60.2%`, foreground `0 0% 98%` | Error/destructive shared controls | `globals.css`, shared `Button`, `Badge`, form controls | Verified |
| `--ring: var(--brand)` | Focus ring for shared controls | `globals.css`, shared components | Verified |
| Shell `--member-primary: #1d441d`, `--member-brand: #345c32`, `--member-ink: #181e00`, `--member-muted: #667061`, `--member-outline: #d4d9ca`, shell background `#f8faef` | Authenticated shell nav, text, dividers and canvas | `member-layout.css` | Verified |
| Shell hover `#f4f7ee`; active child `--member-primary` background and `--member-mint` text | Sidebar states | `member-layout.css` | Verified |
| Dark semantic `--background: 240 10% 3.9%`, `--foreground: 0 0% 98%`, `--secondary: 240 3.7% 15.9%`, `--muted-foreground: 240 5% 64.9%`, `--destructive: 0 62.8% 30.6%` | Shared dark primitives | `globals.css` `.dark` | Verified |
| Dark Platform `#101d11` canvas, `#1a2a1a` surface, `#edf4e9` text, `#3c503b` border | Explicit Platform overrides | `src/pages/superadmin/platform-admin-layout.css`, `platform-dashboard.css` | Verified |

`--secondary` and `--muted` are both `240 4.8% 95.9%` in light mode; they have different semantic names despite the same value. `--brand` and shell `--member-primary` are distinct greens. `--outline` and shell `--member-outline` are distinct border sources. Preserve these differences instead of replacing one by eye. `#345c32`, `#153e2f`, `#667061`, and `#9cac54` recur as hardcoded feature colors; for example `landing.css`, `marketplace.css`, and `trainer-workspace.css`. The landing hero uses `linear-gradient(180deg, #97cd971c 0%, #ffffff 80%)`; the auth layout has translucent mint blurred circles; Dialog overlay uses `bg-black/60 backdrop-blur-sm`. These are local treatments, not global decoration rules.

**State colors.** Success/warning/info do not have a complete global semantic scale: **Not found** in `globals.css`. Platform queue priority (`platform-dashboard.css`), Owner status dots (`gym-owner-dashboard.css`), and feature-specific error values (`workout-plans.css` `--wp-error: #9f1c16`, onboarding destructive fallback `#b42318`) should be consulted for those respective features. Do not infer a universal success, warning, or chart palette from them. Dark behavior outside explicit `.dark` rules and shared tokens needs browser verification.

## 4. Typography System

`index.html` loads Be Vietnam Pro weights 400, 500, 600, 700, 800 and IBM Plex Mono weights 500, 600, 700 from Google Fonts. `globals.css` defines `--font-ui` and `--font-display` as Be Vietnam Pro stacks, and `--font-data` as IBM Plex Mono with monospace fallbacks. Tailwind maps `font-sans`, `font-display`/`font-syne`, and `font-mono`/`font-data` to these variables. The `font-syne` utility name is a legacy alias; its actual font is Be Vietnam Pro (`tailwind.config.ts`). Font delivery when Google Fonts is unavailable falls back to the CSS stacks; offline visual equivalence is **not verified**.

| Role | Exact example | Source | Scope |
| --- | --- | --- | --- |
| Shared body | `font-family: var(--font-ui)`; browser/Tailwind base size and line height otherwise | `globals.css` | Global |
| Shared card title | `text-2xl font-semibold leading-none tracking-tight` | `src/shared/ui/card/Card.tsx` | Shared CardTitle, overridable |
| Shared panel title | `text-lg font-bold text-forest` | `src/shared/ui/workspace/Workspace.tsx` | Operational panels |
| Shared button | `text-sm font-bold` | `src/shared/ui/button/buttonVariants.ts` | Shared Button |
| Shared label | `text-sm font-medium leading-none` | `src/shared/ui/label/Label.tsx` | Shared Label |
| Table head | `10px`, bold, uppercase, `0.07em` tracking | `src/shared/ui/table/Table.tsx` | Shared table |
| Badge | `10px`, bold, uppercase, `0.05em` tracking | `src/shared/ui/badge/Badge.tsx` | Shared badge |
| Shell brand | `25px`, display font, line height `1`; role pill `10px` | `member-layout.css` | Portal shell |
| Shell group/link | `12px` / `11px`, 700, uppercase, `0.08em` / `0.045em` | `member-layout.css` | Sidebar |
| Shell context | `11px`, 700, uppercase, `0.09em` | `member-layout.css` | Topbar |
| Landing H1/H2/H3 | `clamp(44px, 5.4vw, 84px)` / `clamp(34px, 4vw, 60px)` / `26px`; heading line height `1.08` | `src/features/landing/ui/landing.css` | Public landing only |
| Numeric display | IBM Plex Mono via `font-data` or explicit declaration; tabular numbers in analytics table | `trainer-workspace.css`, `marketplace.css`, `gym-owner-analytics.css` | Feature specific |

The landing uses heading letter spacing `-0.05em` (H3 `-0.035em`), while operational metadata often uses positive tracking and uppercase. Long labels are truncated in the mobile bottom navigation (`text-overflow: ellipsis; white-space: nowrap`) and onboarding step labels. There is no single enforced global heading scale beyond Tailwind defaults and these component rules: **Not found**. Apply the closest page hierarchy, including real heading tags; note `CardTitle` defaults to a `div` unless `as` is set.

## 5. Layout and Spacing System

The authenticated shell fixes the sidebar on the left, offsets `.member-main` by its width, and keeps a 64px sticky topbar. `--sidebar-width` is 250px expanded, 72px collapsed at `min-width: 861px`; the collapse transitions sidebar width and main padding together. The sidebar brand block is at least 74px high. The topbar uses horizontal padding `clamp(18px, 3vw, 40px)`. Sources: `member-layout.css`, role layout components.

For content in operational pages, `WorkspacePage` uses `width: calc(100% - 40px)`, `max-width: 1160px` or `1400px` with `width="wide"`, top padding 30px and bottom padding 64px. `WorkspacePanel` is a bordered `bg-card` section; its header is `px-6 py-5`, content `p-6`. The Platform dashboard instead uses `width: min(100%, 1380px)` and `padding: clamp(20px, 3vw, 40px)`. Trainer workspace has local 1160px/1400px widths. Member marketplace uses `padding: 34px clamp(22px, 4vw, 58px) 70px`. These are real variants, not one universal content width.

Tailwind's default spacing scale is active; no custom spacing scale is defined in `tailwind.config.ts`. Repeated gaps include 6/10/12/16/18/20px in feature CSS, and utility `gap-2`/`gap-4`/`p-6` in shared components. Radius is `--radius: 0.5rem` for Tailwind `rounded-lg`, with `md = radius - 2px` and `sm = radius - 4px`; buttons, badges, nav children, and some feature controls deliberately use `999px` pills. Card default has `rounded-lg shadow-sm`; panel and attention variants omit shadow. Operational dashboards commonly use bordered flat panels. Do not apply a rounded card to every page by default.

Tables scroll horizontally via `TableContainer` (`overflow-x-auto`). The desktop sidebar is fixed; its nav area scrolls, while the topbar is sticky (`member-layout.css`). Modal content is fixed at viewport center. Feature grids collapse at their own breakpoints; see §13.

## 6. Header and Navigation

**Role portals.** `MemberLayout.tsx`, `TrainerLayout.tsx`, `GymOwnerLayout.tsx`, and `PlatformAdminLayout.tsx` share `member-layout.css`; Platform adds `platform-admin-layout.css`. The sidebar contains a Fit® brand/role, collapse control, searchable grouped navigation, profile summary, and sign-out. Group buttons have `aria-expanded`/`aria-controls`; selected child links are dark green pills with mint text. Sidebar group icons are generally Lucide 20px, child icons 16px, both often `strokeWidth={1.8}`. Active group triggers get pale hover/selected background `#f4f7ee`.

The desktop topbar is 64px, sticky, translucent white (`rgba(255,255,255,.96)`) with 12px backdrop blur and a bottom border. It has a Fit®/context trail, language button, and profile summary. Platform also exposes `ThemeToggle`. Member/Trainer/Owner share the pattern but may differ in actions or context text; read the role component. No global notification bell/menu is present in the shared topbar: **Not found**; notifications may be navigation destinations.

At 860px and below, the desktop topbar hides, a fixed 64px mobile header appears, and the sidebar becomes an off-canvas drawer (`min(300px, 84vw)`) with a dim overlay. Member and Trainer have five bottom nav columns; Owner derives up to four primary destinations from its groups. Platform does not render a bottom nav; its mobile override removes bottom padding (`platform-admin-layout.css`). Check each role component before copying mobile navigation. At 420px, role pill hides and bottom nav labels shrink to 9px where a bottom nav exists.

The collapse toggle is desktop only. Collapsed desktop groups show icon buttons and open a fixed flyout next to the 72px rail. `src/shared/ui/sidebar-controls.tsx` closes flyouts on Escape (restoring focus), outside pointer down, and route changes via layout effects; it resets collapsed state on crossing into mobile. Search filters localized labels and is hidden when collapsed. Collapse is local component state, not persisted across reloads. No universal navigation disabled state exists; specific unavailable child items are rendered as disabled buttons and marked `.is-unavailable`.

`PortalLayout.tsx` is a separate generic shell: 56px header, 48-unit (`w-48`) desktop aside, centered Tailwind `container`, `md` breakpoint, and a default/pill nav style. Do not mix its measurements with the newer role shell without checking route usage. The public landing has its own sticky, minimum 76px header (`landing.css`); authentication uses `AuthLayout.tsx`.

## 7. Button System

The shared `Button` (`src/shared/ui/button/Button.tsx`) uses CVA classes from `buttonVariants.ts`, supports `asChild`, and defaults to the `default` variant and size. All shared variants are full pills (`rounded-full`), `text-sm font-bold`, `gap-2`, with `transition-colors`, a two-pixel focus-visible ring and ring offset, and disabled pointer blocking plus `opacity-50`.

| Existing shared variant | Implemented appearance | Typical choice |
| --- | --- | --- |
| `default` | Primary green background, white text, 90% opacity hover | Main action |
| `accent` | Lime background, green text, green 20% border, 80% hover | Prominent highlight |
| `destructive` | Destructive background/foreground; 90% hover | Destructive action |
| `outline` | Border and page background; accent hover | Secondary outlined action |
| `secondary` | Muted secondary fill; 80% hover | Lower emphasis filled action |
| `ghost` | Transparent; accent hover | Utility/icon action |
| `link` | Green text with underline on hover | Text link action |

Sizes: `default` `h-10 px-4 py-2`; `sm` `h-9 px-3`; `lg` `h-11 px-8`; `icon` `h-10 w-10`. Width is content based unless caller adds `w-full` (e.g. auth submit). There is no shared named `tertiary` variant; use existing `ghost`/`link` as implemented, not a new API. The shared component has no built-in loading spinner; callers set `disabled`, pending text, or icons. Pressed state has no dedicated shared style: **Not found**.

Local exceptions: landing `.fit-button` is 46px high with 22px horizontal padding and a 13px/600 label; it has green and outline styles (`landing.css`). Onboarding `.gym-owner-onboarding__button` is at least 2.65rem high with primary, secondary, and danger modifiers. Trainer `.trainer-primary-action` is 42px minimum, 11px/800 text. These are implemented feature languages; do not replace them with a shared Button without reviewing visual parity. Icon-only buttons need an accessible name; examples are sidebar toggle, sign-out, and dialog close.

## 8. Component Library and UI Patterns

| Component / pattern | Anatomy, variants, behavior, and source |
| --- | --- |
| Cards/panels | Shared `Card` has `default` (rounded/shadow), `panel` (flat), `attention` (lime-tinted), plus Header/Title/Description/Content/Footer (`src/shared/ui/card/Card.tsx`). `WorkspacePanel` is a flat section with separate header/content. Feature dashboards define their own widget grids. |
| Inputs | Shared `Input`, `Textarea`, `Select`, `Checkbox`, `Label` in `src/shared/ui`. Input/Select are `h-10`, `rounded-md`, bordered, `text-sm`; textarea is `min-h-24`. Select adds a right 16px ChevronDown. Checkbox is 20px with green checked fill and white check. Native radio controls appear in feature forms; no shared Radio component was found. |
| Search/filter | `SidebarSearch` is a 38px-minimum bordered field. Marketplace has a 3-column filter panel (`marketplace.css`); analytics has date presets/custom range and chart tabs (`gym-owner-analytics.css`). Use the nearest feature's filter grammar. |
| Tabs | Shared Radix `Tabs`: 40px muted list, active lime trigger with bold green text, focus ring and disabled state (`src/shared/ui/tabs/Tabs.tsx`). Some features use local button tabs instead, including Owner analytics. |
| Tables/lists/pagination | Shared `TableContainer` horizontally scrolls; green-tinted head, 44px header cells, 10px uppercase labels, 12px cell padding, row hover canvas and selected lime faint (`src/shared/ui/table/Table.tsx`). Feature lists and pagination use local implementations; e.g. `TrainerExerciseLibraryPage.tsx`, `platform-operations.css`. |
| Badges/status | Shared `Badge` is min-height 24px, pill, 10px uppercase with `default`, `accent`, `neutral`, `destructive` (`src/shared/ui/badge/Badge.tsx`). Feature specific status chips/dots live in workout, dashboard, and operations CSS. |
| Dialogs | Radix wrapper supplies `Dialog` primitives, fixed 60%-black blurred overlay, centered `max-w-lg` panel, close icon, lime header strip, responsive footer order (`src/shared/ui/dialog/Dialog.tsx`). Some dialogs add feature class names. |
| Dropdowns/tooltips | Radix dropdown dependency is installed; a single documented global wrapper or tooltip component was **not found** in `src/shared/ui`. Collapsed sidebar uses native `title` and custom flyouts. Verify local code before implementing a new menu. |
| Feedback | Sonner `Toaster` uses rich colors, top-right, 4000ms (`src/shared/ui/toast/Toaster.tsx`); shared `EmptyState` is a dashed bordered box with optional icon/action; shared `Skeleton` pulses on a muted surface. Full-page spinner and route loader are separate (`src/shared/ui/loading`, `member-layout.css`). |
| Metrics/progress | Owner dashboard, Platform dashboard, Trainer workspace, Member dashboard and onboarding implement local metrics/status/progress. There is no one global metric-card or progress-bar primitive. Use the nearest product area. |
| Images/avatars | Shell avatar is a 34px circular initial or icon (`member-layout.css`); Marketplace gym card has a CSS visual; portraits and anatomy imagery have their own feature treatment. Do not infer one global crop rule. |

## 9. Animation and Motion System

The project uses CSS transitions/keyframes and Tailwind `tailwindcss-animate`. No Framer Motion dependency is declared. For Tailwind utilities such as `transition-colors`, duration/easing are Tailwind defaults unless an explicit utility is added; do not state a numeric duration for them based solely on the component class. The `tailwindcss-animate` classes in Dialog have an explicit `duration-200` on content, while overlay duration is not explicitly set in that component.

| Interaction | Trigger | Visual change | Duration | Easing | Implementation reference |
| --- | --- | --- | --- | --- | --- |
| Desktop sidebar collapse | Toggle click | Sidebar 250→72px; content left padding tracks width | 500ms | `cubic-bezier(0.4,0,0.2,1)` | `member-layout.css` variables and width/padding transitions |
| Sidebar labels hide/reveal | Collapse | Opacity/visibility | 230ms, reveal delay 120ms where declared | `ease` | `member-layout.css` |
| Sidebar group/link hover | Pointer hover | Border/background/color | 160ms | `ease` | `member-layout.css` |
| Group chevron | Expand/collapse | Rotate 180° | 180ms | `ease` | `member-layout.css` |
| Mobile drawer | Menu click | Translate X into viewport | 220ms | `ease` | `member-layout.css` mobile rule |
| Dialog entrance/exit | Radix state | Overlay fade; content fade and zoom 95→100% | Content 200ms; overlay exact duration **not verified** | Plugin default, **not verified** | `src/shared/ui/dialog/Dialog.tsx` |
| Shared button/tab feedback | Hover/active | Colors or tab surface | Exact duration **not specified locally** | **Not specified locally** | `buttonVariants.ts`, `Tabs.tsx` |
| Route loading | Suspense fallback | Spinner rotation | 900ms | linear, infinite | `member-layout.css` |
| Workout skeleton | Loading state | Moving background gradient | 1.4s | ease-in-out, infinite | `workout-plans.css` |
| Landing hover | Hover | Background/text color | 0.2s | Browser default timing for declaration | `landing.css` |

Many feature sheets include `@media (prefers-reduced-motion: reduce)` to disable their own transitions or animations; the sidebar and workout skeleton explicitly do so. No single global reduced-motion rule was found, so audit each newly touched feature. Page-to-page transition animation is **not found** in the routing layer. Smooth scrolling is only feature specific (e.g. Platform gym operation honors reduced-motion preference); no universal scroll animation rule was found.

## 10. Forms and Interaction States

Shared controls have a bordered background, muted placeholders, `focus-visible` green border plus two-pixel ring and two-pixel offset, disabled cursor/opacity, and `aria-invalid=true` destructive border/ring (`Input`, `Textarea`, `Select`). `Label` is a Radix label wrapper with peer-disabled opacity. Checkbox has a checked green square and focus ring. Shared controls themselves do not render helper text, required marks, or validation messages; form compositions supply those.

`LoginForm.tsx` uses React Hook Form + Zod, explicit labels, `noValidate`, visible field/root errors and pending disabled submit. `CheckInDialog.tsx` combines Radix dialog, form fields, pending state and success/error toasts. Owner onboarding uses two-column form grids, wide fields spanning both columns, `0.8rem` error text, a three-step progress row, and disabled/focus styles (`gym-owner-onboarding.css`). Some local form controls use custom CSS or browser-native select/radio. **Visual affordance is not proof of behavior:** several pages use local sample data or browser storage per `README.md`; verify the handler and data source before documenting an action as server backed. Keyboard support is verified for Radix primitives and the sidebar Escape flyout logic from source; complete keyboard traversal and screen-reader output are **not verified** without runtime testing.

## 11. Data Visualization and Information Density

There is no charting package in `package.json`; charts inspected are hand-built SVG/CSS. `AnalyticsTrendChart.tsx` uses a `760 × 250` SVG viewBox with 26px padding, three horizontal grid lines, current and previous polylines, and an `aria-label` listing series values. `gym-owner-analytics.css` styles current as `hsl(var(--brand))` 4px and previous as `var(--mint)` 3px; SVG renders full width at 250px height and includes a compact legend. It does not expose point-hover tooltips in this component. The analytics page formats VND with `Intl.NumberFormat` currency, counts with locale number formatting, signed deltas, and localized dates (`GymOwnerAnalyticsPage.tsx`). It has loading/partial/empty states, date presets and a custom range.

`TrainerWorkspacePages.tsx` defines local `MiniLineChart`; Member dashboard has a recent seven-day volume graphic driven by completed sessions (`MemberDashboardPage.tsx`). Platform dashboard favors four summary counts and queue widgets rather than a graph (`PlatformDashboardPage.tsx`, `platform-dashboard.css`); its four-column summary becomes two columns by 1050px. Owner dashboard uses a two-column widget grid and compact status metrics (`gym-owner-dashboard.css`). Preserve the local hierarchy: period/filter first, primary metrics next, chart or queue, then detailed table/list. Do not introduce chart colors, axes, or tooltip behavior without an adjacent implementation to follow. Empty datasets should use the local empty state rather than fake chart marks.

## 12. Iconography and Assets

The main icon set is `lucide-react` (`package.json`). Shell group icons are commonly 20px/1.8 stroke, links 16px/1.8, bottom nav 19px/1.8, and close/menu icons 20px (`MemberLayout.tsx`, `PlatformAdminLayout.tsx`). Shared Select uses a 16px ChevronDown; EmptyState uses 24px inside a 48px lime circle. Shared button content gap is 8px (`gap-2`). Keep decorative icons `aria-hidden` and give icon-only controls accessible names, as the shell toggle and sign-out do. Native `title` labels aid collapsed nav discoverability but are not a substitute for `aria-label`.

`BRAND_MARK` from `src/shared/config/constants.ts` supplies the role-shell wordmark; Platform currently embeds `Fit®` directly. The landing uses a text wordmark in `landing.css`; auth draws `FIT®` as text (`LoginForm.tsx`). Assets include `src/assets/hero.png`, `public/member-portraits/*.jpg`, `public/male-anatomy-map.png`, `public/favicon.svg`, and `public/icons.svg`. `src/assets/react.svg`/`vite.svg` are present but should not be treated as product brand assets. Existing pages also draw CSS/inline SVG visuals. Do not substitute unrelated icon packs, emoji, or generic stock art for role-shell icons and Fit® wordmarks.

## 13. Responsive Design

Breakpoints are feature scoped, not one app-wide desktop/tablet/mobile taxonomy. Tailwind defaults apply to utility classes; `tailwind.config.ts` only customizes container `2xl` to 1400px.

| Width/rule | Verified change | Source |
| --- | --- | --- |
| `min-width: 861px` | Role sidebar may collapse 250→72px and show flyouts | `member-layout.css` |
| `max-width: 860px` | Mobile header, drawer/overlay, bottom nav where role renders it; desktop topbar hidden; main padding reset | `member-layout.css`, role layouts |
| `max-width: 420px` | Role pill hidden; bottom labels 9px | `member-layout.css` |
| `max-width: 1050px` / `700px` | Platform summary 4→2 columns; widget grid one column at 700px | `platform-dashboard.css` |
| `max-width: 1120px` / `700px` | Owner analytics metrics 3 then 1 column; chart/table regions stack; controls widen | `gym-owner-analytics.css` |
| `max-width: 1180px` / `820px` / `560px` | Marketplace grids and filters change per local CSS | `marketplace.css` |
| `max-width: 1023px` / `480px` | Landing rearranges and tightens independently of portal shell | `landing.css` |
| Other local thresholds | Owner dashboard 920/640; Trainer workspace 1180/1050/760/700; onboarding 920/900/640; workout 1180/860/600 | respective feature CSS |

At mobile widths, a desktop sidebar does not simply disappear: it becomes a drawer, and the available bottom destinations are role-specific. Some desktop-specific content may scroll horizontally or stack. Do not claim a feature has usable mobile behavior merely because a CSS breakpoint exists; no live mobile interaction audit was run.

## 14. Page Composition Patterns

| Pattern | Implemented composition and reuse guidance |
| --- | --- |
| Public landing | Sticky 76px-minimum header, large responsive display headings, audience switch, green/outline CTA, editorial hero gradient and section boundaries. Reference `src/pages/public/LandingPage.tsx`, `src/features/landing/ui/landing.css`; use only for public marketing pages. |
| Authentication | Pale background, centered `max-w-[420px]` form, large brand/title, 48px custom form controls, top back/language row and footer. Reference `AuthLayout.tsx`, `LoginForm.tsx`. |
| Member overview | Content under Member shell; profile/plan summary, status accents, compact labels, seven-day volume display and action links. Reference `MemberDashboardPage.tsx`. |
| Member list/search/detail | Marketplace page has its own padded light canvas, search/filter panel, result count, card grid, then gym/trainer detail and checkout routes. Reference `src/features/marketplace/ui` and `marketplace.css`. Workout plans have a separate feature system row, filters, featured plan and plan grid (`WorkoutPlans.tsx`, `workout-plans.css`). |
| Trainer workspace | Centered 1160px or wide 1400px workspace, right-aligned context tools, metric strip, panels, mini charts, tables, member detail and plan builder. Reference `TrainerWorkspacePages.tsx`, `trainer-workspace.css`. PT dashboard route is currently only a coming-soon card (`PTDashboardPage.tsx`); it is not a visual template. |
| Owner operational dashboard | Toolbar above two-column widget grid; cards have bordered headers, icon blocks and dense lists/metrics. Reference `GymOwnerDashboardPage.tsx`, `gym-owner-dashboard.css`, and shared `Workspace*`. |
| Owner form/workflow | Onboarding progress/status strip, two-column forms, review groups, right-aligned actions, inline errors. Reference `src/features/gym-owner-onboarding/ui`. |
| Owner analytics | Range selector, compact metric row, SVG trend/legend, detailed table and explicit data states. Reference `GymOwnerAnalyticsPage.tsx`, `AnalyticsTrendChart.tsx`, `gym-owner-analytics.css`. |
| Platform overview/operations | 1380px max dashboard with four summary cells, queue widgets and customizable visibility; operation pages use bordered list/detail patterns. Reference `PlatformDashboardPage.tsx`, `platform-dashboard.css`, `src/features/platform-admin-operations/ui`. |

For new pages, copy hierarchy and spacing from the nearest role/feature type, not business content. In most operational pages the page action or filter bar precedes bordered content. Heading placement varies by page; inspect the closest example rather than imposing the landing heading scale.

## 15. Design Consistency Rules

- **Do** begin with the existing route's role layout and closest feature CSS. **Don't** embed a second header/sidebar inside a portal page.
- **Do** use shared semantic Tailwind colors and `src/shared/ui` primitives where their implemented form matches. **Don't** normalize feature-specific greens, borders, or radii without a deliberate design-system migration.
- **Do** use Be Vietnam Pro, with IBM Plex Mono for numeric/data treatments already present. **Don't** add a new typeface or assume `font-syne` loads Syne.
- **Do** keep primary actions as existing green or feature-specific established buttons and use the existing focus/disabled states. **Don't** invent a `tertiary` Button API or add shadows/gradients across operational panels.
- **Do** preserve pill treatments where present and square panels where present. **Don't** generalize landing/auth visuals to portal dashboards.
- **Do** preserve bilingual labels, role-specific navigation and responsive destinations. **Don't** assume each role has the same bottom navigation.
- **Do** honor local reduced-motion rules and explicitly check accessibility names/labels. **Don't** infer runtime animation timing from a class with no duration.
- **Do** document new exceptions near their feature and add a semantic token only when it is shared. **Don't** silently turn an isolated literal color into a project-wide rule.

## 16. Implementation Reference Index

| File path | Responsibility | Relevant rules / reuse guidance |
| --- | --- | --- |
| `tailwind.config.ts` | Tailwind theme mappings | Use semantic color, font and radius aliases; default Tailwind spacing/breakpoints remain. |
| `src/styles/globals.css` | Light/dark tokens, base body, attention utilities | First source for theme values. |
| `index.html` | Font delivery | Be Vietnam Pro and IBM Plex Mono loading. |
| `src/app/router/index.tsx` | Role route tree and lazy pages | Find actual shell/neighbor page before building. |
| `src/shared/config/constants.ts` | Routes, storage keys, brand mark | Use existing route and brand naming. |
| `src/shared/ui/button/buttonVariants.ts` | Shared button variants/sizes/states | Reuse exact CVA API. |
| `src/shared/ui/card/Card.tsx` | Card anatomy and variants | Select default/panel/attention according to context. |
| `src/shared/ui/workspace/Workspace.tsx` | Operational widths/panels | Prefer for Owner/Admin workspace pages where already used. |
| `src/shared/ui/input/Input.tsx`, `src/shared/ui/select/Select.tsx`, `src/shared/ui/textarea/Textarea.tsx`, `src/shared/ui/checkbox/Checkbox.tsx` | Form controls | Preserve focus, invalid and disabled states. |
| `src/shared/ui/tabs/Tabs.tsx`, `src/shared/ui/table/Table.tsx`, `src/shared/ui/badge/Badge.tsx`, `src/shared/ui/dialog/Dialog.tsx` | Shared data/navigation/overlay primitives | Use existing variants and Radix behavior. |
| `src/shared/ui/empty/EmptyState.tsx`, `src/shared/ui/skeleton/Skeleton.tsx`, `src/shared/ui/toast/Toaster.tsx` | Empty/loading/toast feedback | Keep state hierarchy consistent. |
| `src/shared/ui/sidebar-controls.tsx` | Collapse, search, flyout interaction | Preserve Escape/outside-click behavior. |
| `src/pages/member/components/member-layout.css` | Shared role-shell geometry and motion | Source for sidebar/topbar/mobile measurements. |
| `src/pages/member/components/MemberLayout.tsx`, `src/pages/pt/components/TrainerLayout.tsx`, `src/pages/admin/components/GymOwnerLayout.tsx`, `src/pages/superadmin/PlatformAdminLayout.tsx` | Role navigation and topbar | Reuse route-specific shell; inspect mobile actions. |
| `src/pages/superadmin/platform-admin-layout.css` | Platform dark/mobile exceptions | Preserve explicit overrides. |
| `src/features/landing/ui/landing.css`, `src/pages/auth/components/AuthLayout.tsx` | Public/auth compositions | Do not apply their decoration to portal pages. |
| `src/features/workout-plans/ui/workout-plans.css`, `src/features/marketplace/ui/marketplace.css`, `src/pages/pt/workspace/trainer-workspace.css` | Feature-specific Member/Trainer languages | Use as nearest-page sources, not global tokens. |
| `src/features/gym-owner-dashboard/ui/gym-owner-dashboard.css`, `src/features/gym-owner-analytics/ui/gym-owner-analytics.css`, `src/features/platform-admin-dashboard/ui/platform-dashboard.css` | Operational dashboard/data patterns | Copy hierarchy, breakpoints and data states for adjacent features. |

## 17. New UI Generation Contract for Other AI Tools

> Read `DESIGN_SYSTEM.md` before designing or coding. Identify the destination route and role shell in `src/app/router/index.tsx`. Inspect the closest existing pages and shared components. Reuse the established colors, typography, content width, button and panel treatments, interaction states, and icon library. Preserve the existing header, sidebar, localization, mobile navigation, and reduced-motion behavior. Implement only the requested feature; do not redesign neighboring pages or invent business requirements. When a decision is unsupported here, inspect the code; if it remains ambiguous, ask for clarification. Verify the result against the neighboring page at desktop and mobile sizes, with focus, empty, loading, error, and disabled states as applicable.

Checklist for each new UI task:

- [ ] Correct route, role shell, and nearest feature pattern identified.
- [ ] Existing shared components and semantic tokens reused where appropriate.
- [ ] Typography, spacing, radius, borders, icons, and numeric formatting match the adjacent pages.
- [ ] Hover, focus, disabled, loading, empty, error, and success states checked where relevant.
- [ ] English/Vietnamese labels and accessible names checked.
- [ ] Desktop, mobile drawer/bottom navigation, overflow, and reduced-motion checked.
- [ ] No unrelated visual or functional changes introduced.

### Known gaps and maintenance

This document records source-visible implementation. Actual rendered spacing, font fallback, dark-theme coverage beyond explicit selectors, viewport-specific usability, screen-reader output, and all interaction timings need manual browser inspection. Feature CSS has many local colors and breakpoints; the semantic table captures the shared palette and representative exceptions, not an exhaustive list of every literal in every selector. Update this file when a shared component, token, or role shell changes, and add feature-level exceptions next to the relevant section rather than silently broadening a rule.
