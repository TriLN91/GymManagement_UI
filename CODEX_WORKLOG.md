# CODEX PROJECT WORKLOG

## 1. CURRENT STATUS

### Overall Progress

* Status: In Progress
* Current Phase: Gym Owner M3 complete; M2-A through M2-C remain at their verified checkpoint
* Current Feature: Gym Owner role
* Current Page/Flow: Operational Dashboard with customizable widgets
* Last Updated: 2026-10-01
* Overall Progress: 60% (estimated against the frontend role surface currently represented by the router; Member and Trainer are substantially implemented, Gym Owner M0/M1/M3 and M2-A–C are implemented, while later Gym Owner modules and Super Admin remain mostly placeholders)

### Current Working State

> Gym Owner M0 and M1 are complete. M2-A through M2-C remain implemented and verified while later M2 fields await confirmed business definitions. M3 Dashboard is complete with record-derived local mock data, explicit data states, severity-sorted alerts, and locally persisted widget visibility/order. Existing feature behavior and role shells remain intact.

---

## 2. WHAT HAS BEEN COMPLETED

### Project Foundation

* [x] React 19, TypeScript, Vite application foundation
* [x] Feature-Sliced Design directory structure
* [x] Auth, tenant, and role route guards
* [x] Central route constants and lazy route loading
* [x] English/Vietnamese i18n foundation
* [x] Shared UI primitives, API client, error types, Zustand, React Query, MSW, Vitest, and Playwright setup
* [x] Production build verified on 2026-09-30

### Public and Authentication

* [x] Public landing experience with desktop 3D dumbbell, smooth scroll behavior, reduced-motion handling, and non-WebGL fallback
* [~] Login, registration, forgot-password, and reset-password screens implemented
* [!] Current full E2E login-dependent baseline has eight timeouts because older tests search for the accessible name “Sign in”
* [ ] PT/Gym Admin MFA flow; current code explicitly records it as a Phase 1 placeholder

### Member Shell and Dashboard

* [x] Shared Member role shell with grouped sidebar navigation
* [x] Dashboard route and member dashboard content
* [x] English/Vietnamese language switching in the current shell
* [x] Member navigation groups for Dashboard, Workout, Marketplace, and Profile

### Member Workout

* [x] Workout plan list without redundant plan filters
* [x] Weekly schedule and workout-day detail
* [x] Workout execution for set/rep/load, duration, distance, and interval tracking
* [x] Workout completion with local browser persistence
* [x] Progress tracking and workout history pages
* [x] AI Assessment handoff from an active exercise and return to the workout session
* [x] Achievement tower and local achievement progress model
* [x] Member Workout Builder with per-exercise multi-day assignment and duplicate-day validation
* [x] Male interactive anatomy map filtering the exercise library
* [x] Optional member exercises remain separate from AI/PT plan progress

### Member Profile

* [x] Detailed health and fitness profile setup
* [x] Personal profile view and edit flow
* [x] Account security settings
* [x] Assessment history and detail views
* [x] Read-only PT appointments
* [x] Wearable connection and notification flows using local state

### Member Marketplace

* [x] Gym discovery and gym detail
* [x] Gym offers
* [x] Trainer discovery and trainer detail
* [x] Trainer-specific PT packages
* [x] Checkout and payment-result flow using local/mock data

### Member Coaching

* [~] Coaching plan and check-in implementation exists
* [!] Current coaching E2E checks are not green because their login setup uses the stale “Sign in” selector

### Trainer

* [x] Trainer role shell using the Member visual system and grouped navigation
* [x] Trainer dashboard and member-data overview
* [x] Member list with consistent portrait-led cards and read-only member detail
* [x] Trainer profile view/edit and read-only gym information
* [x] Exercise Library with multi-select filtering and media preview state
* [x] Build a Plan workspace with member, week, and multi-day selection
* [x] Male interactive anatomy map connected to Exercise Library filtering
* [x] Live muscle activation limited to the selected Builder days
* [x] Current Member Workout workspace
* [x] Appointment creation, coaching history, and income pages
* [x] Trainer workspace E2E suite: 7/7 passed on 2026-09-28

### Gym Admin and Super Admin

* [x] Gym Owner dashboard implements Trainer, assignment, PT sales, appointment, alert, and widget-customization scope
* [!] Admin PT and package pages use `ComingSoonPage`
* [!] Super Admin dashboard is a minimal placeholder card
* [!] Super Admin tenant and analytics pages use `ComingSoonPage`

---

## 3. CURRENTLY IN PROGRESS

### Gym Owner Business and UX Discovery

* Status: Completed
* Started: 2026-09-30
* Current progress: Business questionnaire complete; all 48 decisions recorded; route inventory complete; Stitch inspection removed because no Gym Owner frames exist
* Files involved:

  * `CODEX_WORKLOG.md`
  * `src/app/router/index.tsx` (read-only inspection)
  * `src/pages/admin/` (read-only inspection)
  * `D:/SEP/AI_Fitness_Platform_SRS_v1.1.docx` (read-only source)
  * `.cursor/rules/collaboration.mdc`
* What has been completed:

  * Confirmed current `gym_admin` routes are placeholders.
  * Extracted Gym Admin use cases, marketplace, PT, commerce, privacy, and data-ownership rules from SRS v1.1.
  * Separated fixed business constraints from open product decisions.
  * Prepared one questionnaire covering open decisions across seven sections.
  * Confirmed the user's preference: all future multiple-choice questions appear directly in chat; no Canvas unless explicitly requested.
  * Recorded the user's Gym Owner answers for role, onboarding, navigation, dashboard, Offers, Trainer/PT, commerce, security, persistence, Stitch, and first milestone.
  * Resolved the final clarification batch (questions 37–48); no mandatory business questions remain.
  * Confirmed the current `gym_admin` implementation consists of three placeholder routes under the legacy `PortalLayout`, so no existing Gym Owner workflow needs migration.
  * Drafted the approved role structure: onboarding/status, dedicated role shell, Dashboard, Gym Profile/Branches, Offers, Trainers, PT Packages, Customers/Purchasers, Orders & Settlement, Analytics, Notifications, and Account/Security.
  * Inspected local `fit-owner-*` exports and confirmed they are public Owner landing-page references rather than authenticated operations screens.
* What remains: None for business discovery.
* Current blocker: None.
* Next action: Continue through Milestone 0 after resolving the visual-system conflict.

### Milestone 0 — Design System Discovery & UI Foundation

* Status: Completed
* Started: 2026-09-30
* Current progress: Discovery, consolidation decision, implementation, and verification complete
* Files inspected:

  * `tailwind.config.ts`
  * `index.html`
  * `src/styles/globals.css`
  * `src/shared/ui/`
  * `src/pages/member/components/member-layout.css`
  * `src/pages/pt/workspace/trainer-workspace.css`
  * `src/pages/member/profile/member-profile.css`
  * `src/pages/pt/profile/trainer-profile.css`
  * `src/features/marketplace/ui/marketplace.css`
  * `src/features/workout-plans/ui/workout-plans.css`
  * `src/features/camera-assessment/ui/ai-assessment.css`
  * `src/app/providers/PortalLayout.tsx`
* Conflicts found and resolved:

  * Global/shared `primary` previously resolved to a bright green (`hsl(142 71% 45%)`; it now resolves to the approved forest `#345C32` semantic brand token.
  * Shared primitives use 8px radius and `shadow-sm`; current role pages mix square operational panels, pill actions, and rounded feature-specific cards/modals.
  * Active role pages frequently bypass shared Button/Input/Card/Table/Modal styling through page-local CSS.
  * Typography is now centralized as `--font-ui` / `--font-display` = Be Vietnam Pro and `--font-data` = IBM Plex Mono. Unloaded Inter, Barlow, Space Grotesk references and the unused Sora request were removed.
  * Root `--font-display` no longer self-references and works consistently in English and Vietnamese.
  * The legacy `PortalLayout` differs materially from the approved Member/Trainer 250px sidebar and 64px topbar shell.
* Implementation completed:

  * Centralized brand, canvas, surface, ink, muted text, outline, mint, lime, and typography roles in `src/styles/globals.css` and `tailwind.config.ts`.
  * Aligned shared primary/focus behavior with forest green and kept lime for accent/selected/positive states.
  * Extended Button and Card variants without duplicating their systems.
  * Added shared Badge, Checkbox, Select, Textarea, Table, and Workspace primitives for management UI.
  * Preserved the existing Member/Trainer shell, sidebar behavior, responsive navigation, and feature-specific layouts.
* Current blocker: None.
* Next action: Await the user's instruction to begin Gym Owner M1 — Onboarding & Approval.

### Persistent Project Worklog

* Status: In Progress (continuous maintenance)
* Started: 2026-09-30
* Current progress: Initial baseline complete
* Files involved:

  * `CODEX_WORKLOG.md`
  * `.cursor/rules/project-worklog.mdc`
* What has been completed:

  * Inspected repository structure, routes, role layouts, project policies, tests, and Git working state.
  * Recorded implemented, partial, blocked, and placeholder areas without modifying application code.
  * Added an always-applied local rule requiring future sessions to read and maintain this worklog.
  * Recorded current verification results.
* What remains:

  * Continue updating this file after every meaningful task.
  * Recalculate overall progress only when product scope or implemented role coverage materially changes.
* Current blocker: None
* Next action: Restore a green verification baseline before the next large feature, unless the user assigns a different priority.

---

## 4. NEXT TASKS

### Immediate Next Task

1. [x] Implement Gym Owner M3 Dashboard with accessible widget customization.

### Following Tasks

2. [ ] Continue M2-D through M2-H after weekly-hours, media-persistence, and Legal Information definitions are confirmed.
3. [ ] Restore the verification baseline: fix 20 import-order lint warnings and resolve eight stale login-dependent E2E selectors.
4. [ ] Replace remaining Trainer exercise video placeholder media when approved exercise media is available.

> Product-feature priority after verification requires the user's next instruction.

---

## 5. COMPLETED TASK HISTORY

### 2026-09-30 — Initial Repository Audit and Persistent Worklog

**Status:** Completed

**What was done:**

* Inspected the repository, router, role shells, feature folders, project policies, documentation, tests, and current working tree.
* Classified current flows by implemented, partial, placeholder, and blocked status.

### 2026-10-02 — Restore Lint Verification Baseline

**Status:** Completed

**What was done:**

* Corrected the repo’s import-order warnings across the auth screens and public landing components.
* Kept the project aligned with the ESLint `import/order` rule without altering logic or layout behavior.
* Re-ran the verification command `npm run lint && npm run typecheck`.

**Verification result:**

* `npm run lint` completed with no warnings or errors.
* `npm run typecheck` completed successfully with no TypeScript errors.


* Created the persistent worklog and an always-applied local maintenance rule.
* Did not modify application code.

**Files changed:**

* `CODEX_WORKLOG.md`
* `.cursor/rules/project-worklog.mdc`

**Verification:**

* TypeScript: PASS
* Unit/component tests: PASS — 21 files, 69 tests
* Build: PASS
* Lint: FAIL — 20 import-order warnings, 0 errors
* E2E: PARTIAL — 34 passed, 8 failed due to login-button selector timeouts
* UI verification: Not rerun during the documentation-only audit

**Notes:**

* Vite reports future native config-loader warnings for `__dirname`.
* Production build reports a large chunk warning, led by the 3D dumbbell bundle.

### 2026-09-28 — Trainer Builder Selected-Day Muscle Activation Fix

**Status:** Completed

**What was done:**

* Changed Trainer Builder muscle volume to use exercises from the selected day set instead of the whole draft week.
* Added regression coverage for empty days, adding an exercise to an empty day, and switching to another scheduled day.

**Files changed:**

* `src/pages/pt/workspace/TrainerWorkspacePages.tsx`
* `e2e/trainer-workspace.spec.ts`

**Verification:**

* TypeScript: PASS
* Focused lint: PASS
* Trainer E2E: PASS — 7/7
* Build: PASS

### 2026-09-28 — Male Live Muscle Map for Member and Trainer Builders

**Status:** Completed

**What was done:**

* Added a detailed male anterior/posterior anatomy map based on the supplied anatomy reference.
* Added clickable and keyboard-operable SVG muscle regions, selection feedback, volume heat, and a detailed modal view.
* Connected muscle selection to Member and Trainer Exercise Library filtering.
* Added the male anatomy image asset and removed the obsolete map component.

**Files changed:**

* `public/male-anatomy-map.png`
* `src/features/member-workout-builder/model/maleMuscleRegions.ts`
* `src/features/member-workout-builder/ui/MaleAnatomyMuscleMap.tsx`
* `src/features/member-workout-builder/ui/male-anatomy-muscle-map.css`
* `src/features/member-workout-builder/ui/MemberWorkoutBuilder.tsx`
* `src/pages/pt/workspace/TrainerWorkspacePages.tsx`
* `e2e/trainer-workspace.spec.ts`

**Verification:**

* TypeScript: PASS
* Focused lint: PASS
* Member/Trainer focused E2E: PASS at completion
* Build: PASS

---

## 6. BLOCKERS / ISSUES

### Issue: Full lint baseline is red

* Status: Open
* Description: `npm run lint` exits with failure because `--max-warnings=0` treats 20 import-order warnings as blocking.
* Cause: Import grouping/order in Auth, legacy public landing components, and the older PT coaching PlanBuilder page.
* Attempted solution: No application changes were allowed during the initial worklog audit.
* Current state: 0 lint errors, 20 warnings.
* Next action: Apply mechanical import-order fixes, then rerun lint.

### Issue: Eight login-dependent E2E tests time out

* Status: Open
* Description: Auth, Coaching, Coaching accessibility, i18n, and Theme tests wait for a button matching `/sign in/i` and time out.
* Cause: The older tests assume a specific English accessible name; the current login UI/i18n state no longer guarantees that exact selector.
* Attempted solution: Full E2E suite was run to establish the baseline; no app/test code changed during documentation setup.
* Current state: 34 passed, 8 failed.
* Next action: Inspect the login button's intended bilingual accessible name and centralize the E2E login helper or update the UI contract accordingly.

### Issue: Gym Admin and Super Admin are placeholders

* Status: Open
* Description: Most Admin/Super Admin routes render a minimal card or `ComingSoonPage`.
* Cause: Those role flows have not yet been implemented in this repository.
* Attempted solution: None; no confirmed implementation task is active.
* Current state: Routed and guarded, but not functionally complete.
* Next action: Await role mind map, design source, and explicit priority.

### Issue: Trainer exercise media is incomplete

* Status: Open
* Description: Some exercise preview dialogs show “Preview video unavailable”.
* Cause: Approved exercise media is absent from the local catalog.
* Attempted solution: A functional unavailable state is implemented and tested.
* Current state: Layout and dialog behavior work; missing media is visible honestly.
* Next action: Add approved 16:9 media when assets or an API source are provided.

### Issue: Build-tool warnings

* Status: Open
* Description: Vite warns about `__dirname` with the future native config loader and chunks larger than 500 kB.
* Cause: Current Vite/Vitest config uses `__dirname`; the Three.js landing experience produces a large bundle.
* Attempted solution: None during documentation setup.
* Current state: Build passes.
* Next action: Address only when build hygiene or performance is prioritized.

---

## 7. IMPORTANT PROJECT DECISIONS

### Scope and Architecture

* This repository is frontend-only unless the user explicitly changes scope.
* Preserve Feature-Sliced Design: `app → pages → features → entities → shared`.
* Reuse existing components, layouts, state stores, and design tokens before creating new ones.
* Use mock/local state when an API is unavailable and label it honestly.
* Do not invent features outside the SRS, mind maps, Stitch designs, or confirmed user requirements.

### Visual System

* Apply the same product language across Member, Trainer, Gym Owner, Admin, and Super Admin.
* The official active foundation is the Member/Trainer forest–mint–lime system, consolidated in global semantic tokens.
* Typography roles are Be Vietnam Pro for UI/display and IBM Plex Mono for numeric/data content; do not reference unloaded fonts.
* Future management pages should use shared Badge, Button, Card, Checkbox, Input, Select, Table, Textarea, Dialog, Tabs, and Workspace primitives before creating local alternatives.
* Keep existing sidebar colors unchanged.
* Forest green `#345C32` remains the primary action/focus color.
* Energy lime `#E5F796` should occupy roughly 15–25% of the interface through selected states, goals, progress, achievements, positive priority cards, upcoming actions, and completed data; use pale lime tints for large surfaces.
* Keep orange/red for risks, errors, overdue items, failed payments, cancellations, and other warnings.
* Lime marks selected/completed data in charts, calendars, tables, filters, and muscle maps; other series retain forest, mint, or semantic colors.
* The newer confirmed lime rule supersedes older policy text that called Mint the only accent.
* Primary/submit actions, checkbox/radio states, and focus rings remain forest green.
* Use Syne for brand/display, Plus Jakarta Sans for normal product UI, Barlow for workout metrics, Space Grotesk for AI/technical content, and IBM Plex Sans for dense Admin/Trainer data.
* Remove redundant page-level title blocks, eyebrows, welcome headlines, and explanatory subtitles when the persistent sidebar already identifies the destination.
* Cards in one collection may be internally asymmetric but must keep consistent dimensions, image side, image ratio, spacing, information order, and color treatment.
* Stitch is the visual source of truth when a page has a supplied Stitch design; preserve established business logic.

### Workout and Builder

* Member Workout functions remain separate: Plans, Builder, Weekly Schedule, Execution, Progress, Achievements, AI Assessment, and History.
* Member-added optional exercises do not alter AI/PT plan compliance or progress.
* Trainer Plan Builder keeps member, plan name, week, and multi-day selection in its header.
* Duplicate exercises on the same day must be blocked.
* Live muscle activation represents only exercises scheduled on the currently selected days.
* Trainer Build a Plan follows the approved three-panel composition when relevant: Exercise Library, plan canvas, muscle map/summary.
* Exercise configuration should use a modal when the detailed edit workflow is implemented.

### Gym Owner Confirmed Decisions

* `gym_admin` remains the technical role; the interface label is `Gym Owner` / `Chủ phòng gym`.
* One Owner account manages one Gym brand with multiple branch locations; no additional Manager accounts in the baseline.
* Branches share Trainer, Offer, order, analytics, and settlement data. Branches differ only by display/location information such as address, operating hours, facilities, and media.
* The brand uses one settlement account across all branches.
* Owner and Trainer remain separate accounts, even when the same real-world person performs both functions.
* Owner sees the minimum Member identity/contact data needed to fulfill a purchase, plus order/service data; no raw fitness data by default.
* Gym onboarding uses Draft → Submitted → Reviewing → Approved/Rejected → Resubmit.
* The profile is a detailed multi-step flow. Initial verification upload requires a business license; representative and settlement data use forms unless clarified later.
* Marketplace media uses a cover plus reorderable gallery.
* Sensitive approved-profile changes require re-review; ordinary marketplace content updates can publish directly.
* Sidebar includes Dashboard, Gym Profile, Offers, Trainers, PT Packages, Orders & Settlement, Analytics, Notifications, Account/Security, plus Customers/Purchasers.
* Dashboard supports hiding/showing and reordering a predefined widget set. The initial KPI emphasis is Trainers, assignments, PT sales, and appointments; attention content is combined and sorted by severity.
* Offer baseline includes Membership package, Day pass, Trial, Class listing, and a generic `Other service` type that uses the shared name, description, price, duration, and conditions fields without custom schemas or workflows.
* Offer lifecycle: Draft, Scheduled, Published, Paused, Unpublished, Archived. Approved Gyms publish directly; Platform moderates after publication.
* Owner may attach eligible Plus at a read-only Platform-controlled price and may discount only the Gym-service component.
* Post-purchase fulfillment uses a simple internal-only status/notes flow. It is not shown to the Member and does not control payment, settlement, membership activation, or expiry.
* Owner creates Trainer records; Platform Admin approves the Trainer before the system sends an activation link for the Trainer to set their own password.
* Trainer status supports Active, Hidden, Suspended, Unlinked while preserving history.
* Owner creates, edits, and publishes PT Packages.
* Owner sees Member name, package, Trainer, and assignment period, but not raw health/workout/AI data.
* Trainer analytics includes sales, package views, purchases, assignments, and activity only. It excludes Member health outcomes, coaching scores, and Trainer rankings.
* Customers/Purchasers is a read-only operational list containing purchasers, minimum contact information, Offer/PT Package, order, and internal fulfillment status; it is not a CRM.
* Transactions show component-separated service amount, Gym discount, Plus amount, commission, net settlement, payment status, and timestamps.
* Settlement is grouped by payout cycle. Owner submits refund/dispute requests for Platform handling. CSV exports are required.
* Analytics supports 7/30/90-day presets, custom ranges, and previous-period comparison.
* Notifications are in-app only. MFA is mandatory through email OTP. Important actions require an audit log.
* Initial frontend uses local persistence plus mock services.
* Stitch contains no Gym Owner screens; the current codebase and approved Milestone 0 consolidation decision are the visual source of truth.
* First implementation milestone is Role shell + Dashboard. Unapproved Owners are redirected to onboarding or application-status tracking; only approved Owners enter Dashboard.

### Collaboration and Git

* Communicate in Vietnamese.
* When clarification is necessary, provide concrete A/B/C/D choices with a recommendation and impact.
* The user performs commit, push, pull, merge, staging, and Git identity configuration.
* Do not add AI attribution, `Co-authored-by`, or AI contributor metadata.
* AI working documents and rules remain local and Git-ignored; do not force-add them.
* Desktop/web is the current design priority; preserve existing responsive behavior and do not expand mobile scope unless requested.

---

## 8. FILES CHANGED

| File | Purpose | Status | Last Change |
| --- | --- | --- | --- |
| `CODEX_WORKLOG.md` | Persistent project status, decisions, verification, and handoff | Active | 2026-09-30 |
| `.cursor/rules/project-worklog.mdc` | Always-applied local worklog maintenance rule | Active | 2026-09-30 |
| `.cursor/rules/collaboration.mdc` | Vietnamese collaboration and direct-in-chat A/B/C/D questionnaire rules | Active | 2026-09-30 |
| `src/app/router/index.tsx` | Complete role route map and guards | Active | 2026-09-28 |
| `src/pages/member/components/MemberLayout.tsx` | Member shell and grouped sidebar | Implemented | 2026-09-26 |
| `src/features/workout-plans/` | Member plan-to-completion workout flow | Implemented | 2026-09-23 |
| `src/features/member-workout-builder/` | Member Builder and shared male muscle map | Implemented | 2026-09-28 |
| `src/features/marketplace/ui/MarketplacePages.tsx` | Member Marketplace route family | Implemented with local data | 2026-09-28 |
| `src/pages/member/profile/MemberProfilePages.tsx` | Member profile route family | Implemented with local data | 2026-09-28 |
| `src/pages/member/profile/ProfileSetupPage.tsx` | Detailed health and fitness onboarding | Implemented with local data | 2026-09-28 |
| `src/pages/pt/components/TrainerLayout.tsx` | Trainer shell and grouped sidebar | Implemented | 2026-09-27 |
| `src/pages/pt/workspace/TrainerWorkspacePages.tsx` | Trainer dashboard, members, Builder, appointments, history, income | Implemented with local data | 2026-09-28 |
| `src/pages/pt/profile/TrainerProfilePages.tsx` | Trainer profile and gym information | Implemented with local data | 2026-09-28 |
| `src/pages/admin/components/GymOwnerLayout.tsx` | Gym Owner shell reusing the Member/Trainer 250px sidebar and 64px topbar | Implemented | 2026-10-01 |
| `src/features/gym-owner-onboarding/` | Gym Owner M1 onboarding, approval states, rejection editing, and resubmission | Implemented with local persistence | 2026-10-01 |
| `src/app/router/guards/GymOwnerApprovalGuard.tsx` | Prevents unapproved Gym Owners from entering operational routes | Implemented | 2026-10-01 |
| `src/app/router/guards/GymOwnerEditableGuard.tsx` | Locks submitted/under-review/approved applications from editing | Implemented | 2026-10-01 |
| `e2e/gym-owner-onboarding.spec.ts` | End-to-end coverage for onboarding, approval gating, resubmission, and mobile drawer | Implemented | 2026-10-01 |
| `src/pages/admin/` | Remaining Gym Owner operational modules | Placeholder after M1 | 2026-10-01 |
| `src/pages/superadmin/` | Super Admin role pages | Placeholder | 2026-09-28 |

---

## 9. VERIFICATION STATUS

Last full baseline run: 2026-10-01

### Build

* [ ] Not checked
* [x] Passed
* [ ] Failed

Result: `npm run build` passed after Gym Owner Milestone 1. Existing warnings remain for future Vite native config loading and chunks larger than 500 kB.

### TypeScript

* [ ] Not checked
* [x] Passed
* [ ] Failed

Result: `npm run typecheck` passed after Gym Owner Milestone 1.

### Lint

* [ ] Not checked
* [ ] Passed
* [x] Failed

Result: Focused Milestone 1 lint passed. Full `npm run lint` still finds the same 0 errors and 20 pre-existing import-order warnings; `--max-warnings=0` makes the full command fail.

### UI

* [ ] Not checked
* [ ] Partially verified
* [x] Verified

Result: Gym Owner submitted desktop state and mobile drawer were rendered and inspected from Playwright screenshots. Desktop uses the established forest/lime management-panel language; mobile has no horizontal overflow and the 300px drawer completes its transition correctly.

### Functional Testing

* [ ] Not checked
* [ ] Partially tested
* [x] Tested

Result:

* Vitest: PASS — 22 test files, 72 tests.
* Gym Owner Playwright: PASS — 4/4 tests for create/submit, rejection/edit/resubmit, approval gating, and mobile drawer.
* Focused Milestone 1 ESLint: PASS — 0 errors, 0 warnings.
* Full-project ESLint: 0 errors and the same 20 pre-existing import-order warnings outside Milestone 1.

---

## 10. SESSION HANDOFF

### Last Session

**What we were working on:**

* Gym Owner Milestone 0 — Design System Discovery & UI Foundation.

**What was completed:**

* Confirmed Stitch has no Gym Owner screens and removed Stitch from the role's visual-source requirements.
* Audited global tokens, Tailwind, loaded fonts, shared UI, Member/Trainer shells, role pages, local component systems, and responsive behavior.
* Reported the conflict between global/shared primitives and the active Member/Trainer role language; the user approved Member/Trainer as the official source.
* Centralized the approved forest–mint–lime palette and Be Vietnam Pro / IBM Plex Mono typography roles.
* Removed references to unloaded Inter, Barlow, and Space Grotesk fonts and removed the unused Sora request.
* Extended shared Button/Card behavior and added Badge, Checkbox, Select, Textarea, Table, and Workspace primitives.
* Verified typecheck, unit tests, production build, focused lint, formatting, and 13 focused E2E tests.

**What was not completed:**

* Gym Owner M1 — Onboarding & Approval has not started.
* The legacy `gym_admin` placeholder routes have not yet been replaced with the approved role shell or business pages.

**Current state:**

* Gym Owner discovery and M0 are complete; the shared foundation is ready for M1.
* Multiple-choice questions will be answered directly in chat; Canvas is not used unless requested.
* Full lint still has the same 20 pre-existing import-order warnings; M0-focused lint is green.

**Exact next step:**

* Begin Gym Owner M1 — Onboarding & Approval only when the user requests it, using the new shared foundation.

**Important context for continuing:**

* Preserve the dirty working tree; changes belong to the user.
* Do not perform Git operations or add AI attribution.
* Keep the worklog and `.cursor` rules local and ignored.
* Update this file throughout meaningful work, not only at the end.
* Use the SRS baseline boundaries: no physical membership/access/attendance/HR/accounting system, no raw Member fitness data for Gym Owner, and separate Gym-service/Plus pricing.
* Present future questionnaires directly in chat as numbered A/B/C/D choices; do not create Canvas unless the user asks for one.

---

## 11. GYM OWNER M1 — ONBOARDING & APPROVAL

Completed on 2026-10-01.

### Implemented

* Operational onboarding entry with completion status and step navigation.
* Brand profile and multiple branch forms with required-field validation and existing Marketplace facility identifiers.
* Business-license metadata upload for PDF/PNG/JPG/JPEG, 10 MB validation, replace/remove state, and accessible feedback.
* Review screen covering brand, branches, facilities, and license metadata.
* Shared Radix Dialog confirmation, loading state, success toast, and local submission persistence.
* Submitted, Under Review, Approved, Rejected, and Draft status experiences without relying on color alone.
* Rejection reason, edit flow, resubmission to Under Review, and submission counter/timestamp.
* Route guards: unapproved Gym Owners are redirected to onboarding/status; only Approved can enter `/admin` operational placeholders.
* Shared Gym Owner shell using the Member/Trainer sidebar, topbar, drawer, bottom navigation, language toggle, and existing sidebar colors.

### Scope boundaries retained

* Frontend/local Zustand persistence only; no backend approval service or document verification.
* Uploaded file contents are not persisted; only safe metadata is stored.
* No payment, analytics, trainers, customers, revenue, or unrelated Gym Owner modules were implemented.
* Existing operational `/admin`, `/admin/pts`, and `/admin/packages` pages remain placeholders for later milestones.

### Verification

* `npm run typecheck`: PASS.
* `npm run test`: PASS — 22 files, 72 tests.
* `npm run build`: PASS.
* Focused Milestone 1 ESLint: PASS.
* Gym Owner E2E: PASS — 4/4.
* Visual desktop/mobile inspection: PASS.
* Full lint remains blocked only by 20 pre-existing import-order warnings outside M1.

### Exact next step

* Await the user's next Gym Owner milestone or requested review; do not start unrelated modules automatically.

---

## 12. GYM OWNER M2 — GYM PROFILE

Started on 2026-10-01. Current status: M2-A through M2-C implemented and verified; M2-D through M2-H await confirmed business fields and media persistence behavior.

### Implemented so far

* Approved onboarding Brand/Branch data initializes the Gym Profile once and is then stored separately in `gmc.gymOwnerProfile`.
* Profile Overview uses read-only presentation for Brand, Branches, current license, media empty state, and last-updated metadata.
* Brand Information has explicit detail and edit modes, required-field validation, cancel, immediate save, and toast feedback.
* Branch Management has a branch list, selected read-only detail, add/edit Dialog, existing amenity checkboxes, remove confirmation, and a guard that preserves at least one branch.
* Gym Profile routes are protected by the existing Approved Gym Owner guard and added to the existing Gym Owner sidebar.
* Shared Dialog stacking was corrected so overlays/content appear above the shared mobile header, drawer, and bottom navigation.

### Deliberately not invented

* Weekly structured operating-hours rules have not replaced the current approved free-text branch field.
* Cover/gallery persistence, count limits, upload-size limits, and image processing have not been assumed.
* Legal form fields beyond the approved business-license record have not been invented.
* Legal draft/review/resubmit state will be implemented after the exact legal field set is confirmed.

### Verification at this checkpoint

* Focused M2 ESLint: PASS.
* `npm run test`: PASS — 23 files, 75 tests.
* `npm run typecheck`: PASS.
* `npm run build`: PASS.
* Gym Owner M1 + M2 focused E2E: PASS — 7/7.
* Desktop Profile Overview and mobile Branch Dialog were rendered and visually inspected.

### Required decisions before M2-D through M2-H

* Confirm the structure for weekly operating hours.
* Confirm how frontend-only cover/gallery images should persist and any count/file-size limits.
* Provide the exact Legal Information fields that require approval.

---

## 13. GYM OWNER M3 — DASHBOARD

Completed on 2026-10-01.

### Confirmed scope

* Operational overview for Trainer records, Trainer–Member assignments, PT package purchases, appointments, and severity-sorted operational alerts.
* Local widget preferences for show/hide and accessible reorder controls.
* Explicit Loading, Loaded, Empty, and Error rendering for every widget.
* No revenue, conversion, occupancy, performance score, health, workout, or AI metrics.

### Current implementation step

* Repository, M1/M2 patterns, Gym Owner business decisions, shared primitives, and relevant SRS boundaries inspected.
* SRS contains the underlying Trainer, assignment, PT purchase, and appointment concepts but does not define extra Dashboard KPI formulas.
* Implemented five independent widgets for Trainers, assignments, PT sales, appointments, and combined alerts.
* Every widget uses the same explicit Loading, Loaded, Empty, and Error boundary.
* Trainer figures are derived from mock Trainer records and the confirmed Active, Hidden, Suspended, and Unlinked statuses.
* Assignment records contain only Member name, package, Trainer, assignment period, and active/historical status.
* PT sales shows purchase records and payment state without revenue, commission, profit, forecast, or conversion metrics.
* Appointments remain an operational overview and do not duplicate appointment management.
* Alerts use high, medium, and low ordering; high/medium use the existing destructive family at different intensity, while upcoming/positive priority uses lime.
* Added a shared customization dialog with checkbox visibility controls, keyboard-operable Up/Down ordering, draft/cancel behavior, reset, save, and local persistence through `gmc.gymOwnerDashboardPreferences`.
* Removed the old `/admin` placeholder while preserving the existing approval guard and Gym Owner shell.
* Added English/Vietnamese Dashboard copy, responsive one-column behavior, reduced-motion handling, and an intentional all-widgets-hidden state.

### Files added or updated

* `src/features/gym-owner-dashboard/`
* `src/pages/admin/AdminDashboardPage.tsx`
* `src/shared/config/constants.ts`
* `e2e/gym-owner-dashboard.spec.ts`
* `e2e/gym-owner-onboarding.spec.ts`

### Verification

* Focused M3 ESLint: PASS — 0 errors, 0 warnings.
* TypeScript: PASS.
* Vitest: PASS — 26 files, 82 tests.
* Production build: PASS; existing Vite native-loader and large Three.js chunk warnings remain.
* Gym Owner M1 + M2 + M3 E2E: PASS — 10/10.
* M3 E2E: PASS — Dashboard contents, severity ordering, hide/show, reorder, persistence, console errors, and mobile overflow/dialog behavior.
* Desktop Dashboard and 390px mobile customization dialog were rendered and visually inspected.
* Full-project ESLint still reports exactly 20 pre-existing import-order warnings outside M3 and 0 errors.

### Mock/local data boundary

* Dashboard records are isolated in `dashboardMockData.ts` and are explicitly temporary frontend data.
* Widget preferences persist locally only; no cross-device or backend synchronization was added.
* No unsupported KPI formula, revenue figure, health data, workout data, AI result, chart, or filter was introduced.

### Remaining work

* Replace Dashboard mock resources with approved API resources when backend endpoints are available.
* M2-D through M2-H remain paused at the existing checkpoint pending the three confirmed business definitions already recorded above.

---

## 14. GYM OWNER M4 — TRAINERS & PT PACKAGES

Started on 2026-10-01. Current status: M4-A through M4-G and the Publish half of M4-H are implemented and verified. The exact state after Unpublish still awaits the required product decision.

### Sources confirmed

* Trainer profile fields already exist: full name, email, phone, avatar, bio, specializations, experience years, and self-introduction.
* PT Package fields already exist in Marketplace: Trainer, localized name, sessions included, duration days, Gym-service price, localized features, and published state.
* SRS confirms each Trainer belongs to exactly one Gym, PT Packages are Trainer-specific, and a confirmed PT purchase activates the Trainer–Member Assignment.
* Confirmed project decisions define Trainer operational statuses as Active, Hidden, Suspended, and Unlinked with history preserved.

### Decisions still required

* The exact state after Unpublish because the M4 prompt explicitly prohibits guessing between Draft and another state.

### Decisions confirmed after inspection

* Trainer operational status follows `Active ↔ Hidden` and `Active ↔ Suspended`; Unlinked is terminal.
* Normal Trainer-specific PT purchases still activate assignments automatically; Gym Owner handles assignment exceptions only.

### Implemented

* Added a typed, locally persisted Trainer and PT Package domain store with centralized mock data and explicit transitions.
* Added Trainer list, create, detail, edit, approval submission, rejection reason, resubmission, separate approval/operational status, and assigned-member views.
* Enforced `Active ↔ Hidden`, `Active ↔ Suspended`, and terminal `Unlinked` transitions without exposing a Gym Owner approval action.
* Added assignment-exception management. Only Platform-approved Active Trainers appear as replacements; successful resolution updates the active assignment and preserves the exception history.
* Added PT Package list, create, draft edit, detail, bilingual features, and Publish confirmation using the exact existing Marketplace fields.
* Kept Unpublish visible but disabled with an explicit pending-rule message instead of inventing its resulting state.
* Added dedicated Gym Owner sidebar groups and routes for Trainers, assignment exceptions, and PT Packages while preserving the existing shell colors and behavior.
* Added responsive desktop/tablet/mobile layouts, labels, status text, confirmation dialogs, validation, saving states, toasts, reduced-motion behavior, and no-overflow mobile rendering.

### Verification

* Focused M4 ESLint: PASS — 0 errors, 0 warnings.
* Full-project ESLint: PASS — 0 errors, 0 warnings.
* TypeScript: PASS.
* Vitest: PASS — 27 files, 87 tests.
* Production build: PASS.
* M4 E2E: PASS — 5/5, covering create/submit, status lifecycle, terminal Unlinked, assignment exception resolution, package create/edit/publish, and mobile overflow.
* Gym Owner Dashboard regression E2E: PASS — 3/3 when rerun sequentially.
* One pre-existing onboarding resubmission E2E remains failing because the seeded license step stays on Step 2; M4 routes and components are not involved.
* Trainer list, PT Package detail, and 390px assignment exception screens were rendered and visually inspected.

### Mock/local data boundary

* Trainer, assignment exception, and PT Package records are centralized in `src/features/gym-owner-training/model/mockData.ts`.
* State persists in the browser under `gmc.gymOwnerTrainingManagement` and is ready to replace with API resources later.
* Member visibility is limited to identity, contact, package, Trainer, assignment period, and assignment status. No health, workout, medical, or AI data was added.

### Remaining blocker

* Confirm the exact target state after Unpublish. The M4 source explicitly forbids choosing Draft, Unpublished, Paused, or Archived by assumption.

---

## 15. GYM OWNER M5 — OFFERS

Started on 2026-10-01. Current status: Discovery complete; implementation is paused at the explicit ambiguity gate required by the M5 specification.

### Confirmed sources

* Official M5 Offer types: Membership, Day Pass, Trial, Class, and Other Service.
* Official M5 states: Draft, Scheduled, Published, Paused, Unpublished, and Archived.
* SRS confirms create, edit, publish, and unpublish; Unpublish blocks new purchases and preserves historical purchases and physical-service fulfillment.
* Existing Marketplace Offer data supports localized name, duration days, Gym service price, service discount, localized features, Plus eligibility, Plus duration, Platform-controlled Plus price, and published visibility.
* Class remains an Offer/listing only; no capacity, enrollment, or class scheduling engine is supported.
* Gym Admin controls only the Gym-service component. Plus price remains Platform-controlled and cannot be edited by Gym Owner.

### Missing rules that block implementation

* Exact common fields and any type-specific fields for the five Offer types.
* Exact transition graph for Scheduled, Paused, Unpublished, and Archived.
* Schedule date/time and timezone behavior.
* Which states allow Offer content editing.
* AI Plus eligibility rules and whether Gym Owner may detach Plus after publication.
* Whether the existing service discount belongs in M5 or must remain deferred to M7.

---

## 16. GYM OWNER M6 — CUSTOMERS / PURCHASERS

Completed on 2026-10-01.

### Implemented

* Added a read-only Gym Owner operational list at `/admin/customers` and a dedicated Customers / Purchasers sidebar group.
* Modeled each record as an Order-linked purchaser snapshot containing only name, email, purchased Gym Offer/PT Package, order ID, purchase timestamp, payment method/status, and internal processing status.
* Reused the existing commerce statuses `pending_gym_confirmation` and `trainer_assignment_active`; payment status remains separate from processing/fulfillment state.
* Added no search, filter, pagination, detail page, editing, notes, tags, CRM actions, or settlement functions because none are defined for M6.
* Implemented explicit Loading, Loaded, Empty, and Error rendering.
* Added a semantic desktop table that becomes readable cards on tablet/mobile without horizontal overflow.
* Added English/Vietnamese copy and an explicit read-only indicator.

### Privacy boundary

* No phone was exposed because current Order/assignment sources only confirm name and email as minimum contact information.
* No address, date of birth, emergency contact, health, medical, body measurement, workout, progress, exercise, posture, AI assessment, settlement, commission, or net-received data was added.
* No customer information is written to console output, debug panels, or URL parameters.

### Files

* `src/features/gym-owner-customers/`
* `src/shared/config/constants.ts`
* `src/app/router/index.tsx`
* `src/pages/admin/components/GymOwnerLayout.tsx`
* `e2e/gym-owner-customers.spec.ts`

### Verification

* Focused M6 ESLint: PASS — 0 errors, 0 warnings.
* TypeScript: PASS.
* M6 unit tests: PASS — 2/2, including Loading/Empty/Error and prohibited-field coverage.
* Production build: PASS.
* M6 E2E: PASS — 2/2, including read-only/privacy assertions, console check, semantic table, and 390px mobile overflow.
* M4 regression E2E: PASS — 5/5 in the same sequential run.
* Manual screenshot QA could not be started after verification because automatic approval review reported that the workspace was out of credits. No approval bypass was attempted.

### Mock/local data boundary

* Temporary typed records are centralized in `src/features/gym-owner-customers/model/mockData.ts`.
* The model is intentionally separate from Member fitness/profile and Trainer coaching data and can later be replaced by the Gym marketplace transaction API.

---

## 17. GYM OWNER M7 — ORDERS & SETTLEMENT

Started on 2026-10-01 and completed on 2026-10-05. M7 frontend scope is implemented and verified using backend-owned financial snapshots and read-only settlement behavior.

### Confirmed sources

* Existing Marketplace orders preserve Gym-service amount, service discount, Platform-owned AI Plus amount, checkout total, payment status, and fulfillment status.
* SRS defines the commission base as Gym-service amount, excludes AI Plus from Gym marketplace commission, and sets a configurable 10% baseline rate.
* PT service settlement is attributed to the Gym; Trainer internal compensation is outside Platform calculation.
* Commission and AI Plus pricing are Platform-managed values and must remain read-only for Gym Owner.
* M7 must remain separate from M5 Offer management, M6 customer operations, and M8 analytics.

### Confirmed product decisions

* All financial amounts, including `Net Received`, are authoritative backend-provided values. The frontend does not calculate them.
* Gym Owner has read-only settlement visibility.
* Gym Owner can submit a refund/dispute request to Platform but cannot execute, approve, reject, or financially resolve it.
* Orders and Settlements use separate CSV exports and exclude unnecessary personal, health, workout, and AI-assessment data.

### Implemented

* Added dedicated Gym Owner routes and sidebar navigation for Orders, Order Detail, and Settlement Periods.
* Added a typed M7 data model with explicit backend financial snapshots: Gym Service Price, Discount, AI Plus, Commission, and Net Received.
* Added an operational Orders table with payment/fulfillment state, responsive card representation, and direct detail navigation.
* Added Order Detail with structured order metadata, a five-part financial breakdown, and an explicit backend-value notice.
* Added a keyboard-accessible refund/dispute request dialog with required reason validation and Platform-only processing language.
* Added read-only Settlement Period visibility with backend-provided reconciliation labels and no Gym Owner state-transition controls.
* Added separate Orders and Settlements CSV serialization/download flows. Order exports intentionally omit purchaser name and contact data.
* Added Loading, Empty, Error, and Loaded state handling through a reusable feature-level resource component.
* Added bilingual English/Vietnamese copy, responsive layout, reduced-motion handling, and semantic tables/forms/dialogs.
* Added `docs/M7_BACKEND_ORDERS_SETTLEMENT.md` describing the required backend snapshots, proposed endpoints, authorization, audit, refund/dispute request, CSV schemas, and unresolved authoritative net-received rules.

### Verification

* Focused M7 ESLint: PASS — 0 errors, 0 warnings.
* TypeScript: PASS through production build.
* M7 CSV/privacy unit tests plus M6 regression tests: PASS — 4/4.
* Production build: PASS; existing Vite native-loader and large Three.js chunk warnings remain.
* M7 Playwright E2E: PASS — 4/4, covering order visibility/detail, refund/dispute validation/submission, separate CSV downloads, console safety, and 390px overflow.
* Visual QA: PASS for desktop Orders, Order Detail, refund/dispute dialog, Settlement Periods, and 390px Orders cards.
* Visual QA fixes included UTC period-date formatting, a two-column mobile financial grid, and desktop table sizing so actions remain visible.
* Full-project ESLint remains blocked by exactly 20 pre-existing import-order warnings outside M7 and 0 errors.

### Mock/local data boundary

* Temporary M7 resources are centralized in `src/features/gym-owner-orders/model/mockData.ts`.
* Reconciliation labels in mock data are opaque backend-provided display values, not a frontend-owned state machine.
* Submitted refund/dispute state is local UI state until the backend endpoint described in the backend contract is available.
* No health, workout, body, AI-assessment, commission configuration, Plus-price editing, accounting mutation, or settlement transition capability was added.

### Remaining backend work

* Implement the contract in `docs/M7_BACKEND_ORDERS_SETTLEMENT.md` and replace mock resources with authenticated Gym-scoped APIs.
* Define and own the exact net-received formula, discount attribution, official reconciliation codes, refund/dispute eligibility, and request status lifecycle on the backend/Platform side.

---

## 18. GYM OWNER M8 — ANALYTICS

Started and completed on 2026-10-05. M8 is implemented as one aggregate Gym Owner operational analytics page using backend-owned KPI values and comparisons.

### Confirmed sources

* Official ranges are 7 days, 30 days, 90 days, and a custom range with previous-period comparison.
* Official metric categories are Sales, Views, Purchases, Assignments, and Trainer Activity only.
* Prior Gym Owner decisions clarify that Views means PT Package views and Assignments means Trainer–Member assignments.
* SRS permits aggregate/commercial Gym Admin analytics and explicitly blocks automatic raw Member fitness/AI data access.
* M3 contains typed Trainer, assignment, PT purchase, and appointment mock resources, but no time-series analytics contract.
* M7 contains backend-owned order financial snapshots, but M8 must not derive new financial/accounting definitions from them.
* The project has no installed chart library; existing chart visuals use small native SVG implementations.

### Confirmed product decisions

* Sales is the backend-provided total Gym service sales and excludes AI Plus.
* Views counts PT Package detail views.
* Purchases counts successful Gym Offer and PT Package orders.
* Assignments counts new Trainer–Member assignments activated in the selected period.
* Trainer Activity counts completed PT appointments.
* Backend supplies both absolute and percentage comparison against the immediately preceding period of equal inclusive duration.
* Date ranges use Asia/Bangkok and include both start and end dates.

### Implemented

* Added `/admin/analytics` and a dedicated Analytics sidebar group within the established Gym Owner shell.
* Added a typed aggregate analytics model for the five approved KPI categories with explicit `source: backend` ownership.
* Added 7-day, 30-day, 90-day, and custom date controls. Custom validation requires both dates and prevents a reversed range.
* Added current/previous period labels and backend-provided current, previous, absolute-change, and percentage-change values.
* Added a compact five-metric summary, commercial trend selector, Trainer–Member assignment trend, and non-ranked Trainer Activity table.
* Built charts with accessible native SVG and the existing forest/mint/lime design tokens; no chart dependency was added.
* Added Loading, Empty, Error, and partial-data handling. A missing metric does not hide the remaining backend response.
* Added English/Vietnamese copy, keyboard focus, reduced-motion behavior, semantic table markup, and responsive mobile presentation.
* Kept raw Member health, workout, body, AI assessment, Trainer ranking, accounting formulas, and frontend-derived KPI logic outside M8.

### Verification

* Focused M8 ESLint: PASS — 0 source errors/warnings after excluding the intentionally ESLint-ignored E2E directory.
* Full-project ESLint: PASS — 0 errors, 0 warnings.
* TypeScript: PASS.
* M8 unit tests: PASS — 4/4 for inclusive/equal previous ranges, invalid ranges, backend ownership, and partial responses.
* Production build: PASS; existing Vite native-loader and large Three.js chunk warnings remain.
* M8 Playwright E2E: PASS — 4/4 sequentially, covering approved KPI scope, previous comparison, custom validation/empty/sample states, partial response, console safety, privacy exclusions, and 390px overflow.
* Visual QA: PASS for desktop and 390px mobile. Fixed invalid SVG color-token aliases discovered during screenshot review so both forest and mint trend lines render correctly.

### Mock/local data boundary

* Temporary backend-shaped snapshots are centralized in `src/features/gym-owner-analytics/model/mockData.ts`.
* The custom mock returns data only for 2026-09-01 through 2026-09-15 and returns Empty for other valid ranges rather than fabricating analytics.
* The 90-day mock intentionally omits Views to keep the partial-response UI verifiable.
* Replace these resources with the authenticated Gym-scoped analytics API when it becomes available; preserve backend authority for all KPI values and comparisons.

---

## 19. GYM OWNER M9 — NOTIFICATIONS + ACCOUNT & SECURITY

Started and completed on 2026-10-05. M9 adds Gym Owner in-system notifications, mandatory email OTP before session creation, and a privacy-limited important activity log.

### Confirmed sources

* Gym Owner scope is limited to in-system notifications, mandatory email OTP, and an important activity log.
* SRS notification types include appointment, AI result, purchase/payment, Plus status, promotion/event, and Platform announcement, but does not define the Gym Owner-specific subset or route destinations.
* Existing Member notifications provide a reusable read/unread UI pattern, but their workout/AI data model cannot be copied into Gym Owner.
* Existing authentication has login/register/reset flows and secure session-token handling, but no OTP endpoint, challenge state, route, trigger, length, expiry, resend, or attempt-limit contract.
* The original authentication implementation explicitly deferred MFA for PT/Gym Admin to a later milestone.
* No activity event taxonomy or permitted context fields are defined in SRS, mind map, or the current frontend.

### Confirmed product decisions

* Email OTP is mandatory for every new Gym Owner sign-in session and must complete before access/refresh tokens are stored.
* OTP length, expiry, resend timing, and attempt limit are authoritative backend-provided policy values.
* Gym Owner notifications cover purchase/payment, Trainer approval, Offer moderation, settlement/refund-dispute, and Platform announcements.
* Opening a notification marks it read. Navigation occurs only when the backend provides an allowlisted internal route.
* Important activity covers login/OTP results, password change, sensitive Gym profile changes, Trainer/Offer lifecycle changes, and refund/dispute submission.
* The activity log exposes only time, action, required context, and result; it excludes IP address, device/location data, raw OTP values, tokens, passwords, and other security secrets.

### Implemented

* Added `/verify-email-otp` with backend-shaped challenge/policy state, dynamic code length, paste and keyboard handling, expiry/resend state, invalid/expired feedback, and masked email display.
* Changed Gym Owner login so a session and tokens are created only after successful OTP verification. The pending challenge stays runtime-only and is not persisted.
* Added mock OTP verify/resend endpoints for frontend development. The mock never returns or stores the verification code in browser storage.
* Added `/admin/notifications` with read/unread state, five approved event categories, local read-state persistence, and allowlisted internal route navigation.
* Added `/admin/account-security` with mandatory OTP protection status and a read-only important activity table.
* Added explicit Loading, Empty, Error, and Loaded states shared by the two M9 Gym Owner resources.
* Added English/Vietnamese copy, semantic links/buttons/tables, visible focus treatment, reduced-motion behavior, and responsive layouts.
* Updated the established Gym Owner test login helper and all M1–M8 E2E flows to complete the mandatory OTP gate.

### Verification

* TypeScript: PASS.
* Full-project ESLint: PASS — 0 errors, 0 warnings.
* M9 unit tests: PASS — 7/7 across auth challenge persistence, notification route allowlisting, and resource states.
* Production build: PASS; existing Vite native-loader and large Three.js chunk warnings remain.
* M1–M9 Gym Owner Playwright regression: PASS — 29/29 sequentially.
* Visual QA: PASS for OTP, desktop notifications, desktop account/security, and 390px notification/activity layouts.

### Mock/backend boundary

* OTP challenge delivery, the actual verification code, policy enforcement, attempt accounting, and session issuance must be owned by the production authentication backend.
* Current Gym Owner notification and activity resources are typed local mock data; only notification read IDs persist locally.
* Backend notification routes must remain relative, allowlisted application routes. External URLs and unknown internal paths are rendered without navigation.
* No notification preferences, alternate MFA methods, device/session management, health data, workout data, AI assessment data, or raw security metadata were added.

---

## 20. GYM OWNER M10 — GLOBAL CONSISTENCY & VISUAL QA

Started and completed on 2026-10-05. M10 stabilized the existing Gym Owner implementation through a selective audit, targeted consistency fixes, cross-page visual QA, and final regression verification.

### Audit findings

* P2: The sidebar did not automatically expand the newly active group after in-app navigation between modules.
* P2: Mobile bottom navigation flattened the first four child routes, producing Dashboard plus three consecutive Gym Profile destinations.
* P2: M7–M9 styles hardcoded Sora/IBM Plex Mono rather than consuming the established typography role tokens.
* P2: M1 Onboarding referenced an older undefined `--color-*` token family and therefore used fallback colors outside the canonical Gym Owner palette.
* P2: Onboarding showed Review & submit as Complete in its requirement card but Incomplete in the progress row after submission/approval.
* Missing requirement: M5 Gym Owner Offers has no route, sidebar group, or feature implementation in the current codebase. It was documented rather than invented during the M10 stabilization milestone.

### Implemented

* Made the Gym Owner sidebar expand the active navigation group whenever the route changes.
* Changed mobile bottom navigation to use the first destination from four distinct groups: Dashboard, Gym Profile, Trainers, and PT Packages.
* Bridged M1 Onboarding to the canonical forest/canvas/lime/border/destructive tokens without changing its workflow or validation.
* Replaced M7–M9 local font-family literals with `--font-ui`, `--font-display`, and `--font-data` roles.
* Corrected Review & submit progress completion for Submitted, Under Review, and Approved application states while keeping Draft and Rejected incomplete.
* Added durable E2E assertions for cross-module sidebar expansion, distinct mobile navigation destinations, and submitted Review completion.

### Preserved behavior

* Approval and legal-information boundaries, Trainer operational lifecycle, PT Package publication, read-only customer data, backend-owned financial values, Platform-owned AI Plus pricing, analytics definitions, mandatory OTP, and privacy-limited activity data remain unchanged.
* No new shared abstraction, dependency, status merger, financial calculation, permission, or product feature was introduced.

### Verification

* TypeScript: PASS.
* Full-project ESLint: PASS — 0 errors, 0 warnings.
* Unit tests: PASS — 98/98 across 33 files.
* Production build: PASS; existing Vite native-loader and large Three.js chunk warnings remain.
* M1–M9 Gym Owner Playwright regression: PASS — 29/29 sequentially.
* Targeted temporary visual/overflow audit: PASS — 2/2, then removed from the working tree.
* Visual QA: PASS for desktop Onboarding, Profile, Dashboard, Trainers, Customers, Orders, Analytics, Notifications, and Account/Security; PASS for 390px Onboarding, Orders, Analytics, and Account/Security.
* No runtime console errors or horizontal overflow were found in the representative audit routes.

### Remaining issue

* Gym Owner Offers (M5) remains unimplemented. Completing it requires the original M5 product/data requirements and is outside M10's no-new-feature boundary.

---

## 21. FRONTEND CI/CD STABILIZATION

Completed on 2026-10-08. The user retains ownership of Git commit and push.

* Aligned all CI jobs with `.nvmrc` on Node 22.12.0 and enabled push CI for feature branches.
* Set unit coverage floors to the measured full-source baseline (lines/statements 15%, functions 13%, branches 11%); actual coverage remains approximately 16.09% lines, 16.08% statements, 14.32% functions, 12.02% branches.
* Formatted frontend sources for the existing Prettier gate, excluded the generated MSW worker from ESLint, and refreshed outdated Playwright selectors/expectations for login, Member localization, and Platform Admin theme.
* Verified `npm ci`, `msw:init`, lint, format check, typecheck, 98 unit tests with coverage, production build, and all 71 Chromium E2E tests locally. Existing Vite native-loader, large Three.js chunk, and deprecated Three.Clock warnings are non-blocking.
* CI on GitHub cannot be confirmed before the user's push. No files were staged, committed, or pushed.

---

## 22. PLATFORM ADMIN DISCOVERY — 50 DECISIONS

Recorded on 2026-10-08 from the user's 50-question response. Full question mapping is in the prior assistant turn in this chat; this section highlights decisions with implementation impact.

* UI role label: Platform Admin; existing technical role remains `super_admin`. Use grouped sidebar and Platform Operations Center structure. Avoid oversized page titles.
* Dashboard prioritizes pending approvals, moderation, disputes, and alerts. Widgets can be customized.
* Approval queue uses summary cards (question 9: B) with click-through detail. Gym detail supports approve/reject; rejection requires a selected reason and written note; Admin cannot edit Gym submissions.
* Trainer answer 14 A+B is interpreted as A, since A already includes approve/reject plus suspension.
* Marketplace uses post-publication moderation for Gym, Trainer, Offer, and PT Package listings, with reason, audit, notification, and restore paths.
* One global commission configuration with effective date/history; changes apply to new transactions only. Standalone and bundled Plus prices are Platform-owned, with bundled price not above standalone.
* Campaigns cover platform-wide promotion/events, target Member/Gym Owner/Trainer, with Draft/Scheduled/Active/Paused/Ended/Archived states.
* Transactions expose backend-owned financial breakdown and settlement. Admin cannot directly edit financial records. Disputes follow the user-selected reviewed workflow and show evidence/timeline/order breakdown/Gym conversation.
* Member visibility is limited to minimum identity and transaction data. One Platform Admin role initially. Platform Admin may suspend Gym Owner, Trainer, and Member accounts.
* Security answer 38 D: no additional MFA beyond password in this phase. Audit records approval, moderation, pricing, commission, and dispute actions.
* Visual answer 43 D: minimal information per page, despite operational workflows; use detail navigation for depth. Shared forest/canvas/mint/lime design and bilingual English/Vietnamese UI remain.
* Implementation order: foundation, dashboard, approval, moderation, commercial, dispute, analytics, security. Frontend data uses typed local mocks aligned to future backend contracts. The user handles all Git commit/push/pull/merge.

### Clarifications from user (2026-10-08)

* Q9: Pending approval cards contain only a small summary and an explicit Detail button. The button opens a separate route/page showing the complete application, not an in-place expansion or drawer.
* Q14: Platform Admin can approve, reject, and suspend Trainer accounts.
* Q38: Password-only Platform Admin login for this phase; no additional MFA.

---

## 23. PLATFORM ADMIN MILESTONE 1 — FOUNDATION & OPERATIONAL DASHBOARD

Completed on 2026-10-08. The user retains Git commit/push ownership.

* Replaced the Platform Admin placeholder shell with a role-specific grouped sidebar and responsive mobile drawer while reusing the Member/Gym Owner shell dimensions and shared controls. Future milestone entries are visibly disabled until their routes exist. Existing direct legacy routes remain available.
* Implemented an operational dashboard with clearly labeled typed local sample data for pending approvals, moderation, disputes, and alerts. No Gym/Trainer application approval action is exposed in M1.
* Added frontend resource states for loading, loaded, empty, and error; widget visibility/order persistence using a separate Platform Admin localStorage key; accessible customization dialog; English/Vietnamese copy.
* Preserved the existing theme toggle and added Platform-specific dark contrast. Avoided a redundant large page title; used forest/canvas/mint/lime product styling and the established sidebar color.
* Visual QA completed at 1440px desktop and 390px mobile, including the customization dialog and dark theme. No mobile horizontal overflow or Platform dashboard runtime console errors observed.
* Verification: TypeScript, full ESLint, Prettier check, unit coverage (99 tests), production build, all 74 Playwright E2E tests, and focused Platform E2E after console assertion passed. Existing non-blocking Vite native-loader and large Three.js chunk warnings remain.
* Data/API limitation: dashboard records are explicit local examples. Real queues, counts, timestamps, permissions, and deep links require backend contracts and future milestones.
