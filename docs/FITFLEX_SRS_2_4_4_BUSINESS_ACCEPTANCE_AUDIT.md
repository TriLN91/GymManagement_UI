# FitFlex AI — SRS 2.4.4 Business Acceptance Audit

**Audit date:** 2026-10-27

**Decision:** **NO-GO for SRS 2.4.4 business acceptance**

**Audit branch:** `codex/business-acceptance-audit` in Web, Backend, and Mobile
**Primary baseline:** `FitFlex_AI_SRS_v2_4_4_VI.md`, applied as requested despite its own `DRAFT` / “does not automatically replace v2.4.0” header.

## A. Repository Consolidation

The audit branches in all three repositories were safely fast-forwarded to their latest `main`; no unique audit-branch commit was lost and no merge to `main` was performed. Branch-only commits were inspected by actual diff and none met the standard for safe integration. The exact audited `main` SHAs are Web `f91a6ab01fe874f9448adc7b4f74144801805527`, Backend `c8ad9c82fbc93269f2f81edf1973d6bf1f62826a`, and Mobile `9eb9a98311c8c5b8ed53c3e344878e9efe2b0a50`. Web lint/typecheck/build pass; its 288-test run had one isolated timing failure that passed on retry. Backend build and 212 unit tests pass; integration tests are Docker-blocked. Mobile lint, 326 non-skipped tests, and Web export pass; typecheck fails on two MediaPipe prop contracts. Full branch, PR, build and test evidence appears in the reconciliation and validation details below.

## B. Executive Assessment

The three repositories contain substantial implementations for all six Core Flows, but none is acceptance-complete against SRS 2.4.4. The current product mixes two incompatible business models:

1. the new AI Pass / Gym distribution-credit model; and
2. the older Gym marketplace model with member checkout, commission, settlement, wallet, payout, PT-package session accounting, and commercial AI request quotas.

The second model is explicitly outside SRS 2.4.4. It is not merely dead code: it remains registered in the Backend, routed and advertised on Web, and exposed in Mobile screens. This is the dominant release blocker.

Additional P0 blockers are:

- the new `MemberAiPass` is not enforced at the paid AI execution endpoints required by BR-26;
- no `Active → DeletionRequested → Deleted` Member account-deletion workflow exists (FR-SH-06 / BR-27);
- Gym distribution endpoints accept caller-supplied `gymId` / `branchId` without consistently deriving and enforcing actor scope;
- offer activation and “one active pass” invariants lack database-enforced uniqueness plus demonstrated atomic/idempotent concurrency behavior;
- CF04 completes and consumes a PT session immediately when the Trainer reports completion, instead of entering `AwaitingMemberConfirmation`; dispute resolution is absent;
- CF05 has progression, XP, recovery, pause/resume, and gamification foundations, but not the SRS weekly evidence-based proposal workflow;
- Mobile does not typecheck because two MediaPipe component contracts are out of sync.

### Overall Core Flow verdict

| Core Flow                          | Verdict                |         Highest evidence reached | Acceptance summary                                                                                                                                                                                                           |
| ---------------------------------- | ---------------------- | -------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CF01 AI coaching and plans         | Partial / contradicted |        E2 code + automated tests | Strong plan/RAG/assistant foundation; commercial daily quotas contradict v2.4.4; no new-pass execution enforcement; proposal lifecycle is too coarse for Trainer-first review and CF05 handoff.                              |
| CF02 movement guidance/assessment  | Partial                |    E2, limited E3 build evidence | Admin reference and Member assessment/runtime pipelines exist with significant tests; Mobile typecheck fails; real-device/video proof was unavailable; paid execution entitlement is not demonstrated.                       |
| CF03 AI commerce/pass distribution | Partial / contradicted |             E2 code + unit tests | New catalog/agreement/credit/offer/pass domain exists, but payment activation, tenant scope, concurrency/idempotency, unique-active-pass enforcement, and legacy-marketplace removal are incomplete.                         |
| CF04 Trainer/coaching sessions     | Contradicted           |            E2 code + rules tests | Scheduling, rescheduling, no-show, and trainer-change foundations exist; status machine, dispute flow, actor responsibilities, and PT-session accounting conflict with SRS 2.4.4.                                            |
| CF05 progression/recovery          | Partial                |                  E2 code + tests | XP, streak, badges, schedule, recovery and pause/resume exist; weekly threshold evaluation, evidence snapshots, proposal review/reminders/supersession, and CF02/CF06 reconciliation are missing.                            |
| CF06 external fitness              | Partial                | E2; device acceptance unverified | Strava OAuth and Health Connect import paths exist; exact-source dedupe exists, but cross-provider canonical reconciliation and downstream recalculation are absent; HealthKit and real-device/provider evidence are absent. |

No Core Flow is assigned E4 business-acceptance evidence.

## Repository reconciliation detail

### Baselines reconciled

| Repository                                | Audited `main` SHA                         | Audit branch state before this report                     | Open PRs                       |
| ----------------------------------------- | ------------------------------------------ | --------------------------------------------------------- | ------------------------------ |
| Web — `TriLN91/GymManagement_UI`          | `f91a6ab01fe874f9448adc7b4f74144801805527` | Fast-forwarded 2 commits from its prior remote audit head | PR #8, `fix/cf05-integration`  |
| Backend — `E99PLANT/AI_SEP_FA26_BE`       | `c8ad9c82fbc93269f2f81edf1973d6bf1f62826a` | Fast-forwarded 2 commits from its prior remote audit head | None (no remote PR merge refs) |
| Mobile — `QuangHung02/AI_SEP_FA26_MOBILE` | `9eb9a98311c8c5b8ed53c3e344878e9efe2b0a50` | Fast-forwarded 6 commits from its prior remote audit head | None (no remote PR merge refs) |

All historical Backend PR heads #1–#9 and Mobile PR heads #1–#8 are reachable from current `main`. Web PRs #5, #7, #9, #10 and #11 are merged; #8 remains open.

### Branch-only commits not integrated

| Repository / branch                       |            Divergence from `main` | Decision                                                                                                                                                                                                                                                       |
| ----------------------------------------- | --------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web `duongcnt`                            |              20 behind / 1 unique | Skip. Its equipment-access removal and NASEM calculation change is coupled to the stale Backend `duongcnt` contract and is not a self-contained acceptance fix.                                                                                                |
| Backend `duongcnt`                        |              30 behind / 2 unique | Skip. It replaces OpenAI with Groq, changes CF01 contracts/migrations, and adds CF04 tests across 29 files. Provider replacement is not required by the SRS and the stale cross-cutting delta is unsafe to cherry-pick without a dedicated migration decision. |
| Web `feature/CF05_Fitness_Progression`    | 7 behind / 2 unique (1 non-merge) | Skip. It is mainly mocks, optional-add-on UI, E2E changes, and an old audit document; it overlaps current CF05 code and does not implement the missing weekly proposal domain.                                                                                 |
| Web `fix/cf05-integration` / PR #8        |              46 behind / 1 unique | Skip. It is an older variant of the same mock-heavy CF05 integration and is not merge-ready on the current baseline.                                                                                                                                           |
| Mobile `feature/CF05_Fitness_Progression` |              16 behind / 1 unique | Skip. The unique delta is README/tooling/Android SDK sync only, not missing SRS behavior.                                                                                                                                                                      |

Every other remote feature/audit branch inspected has no commit unique from `main`. No force push, history rewrite, or merge to `main` was performed.

## Validation detail

### Web

| Check                                          | Result                                                                                          |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `npm ci --ignore-scripts`                      | Pass                                                                                            |
| `npm run lint`                                 | Pass                                                                                            |
| `npm run typecheck`                            | Pass                                                                                            |
| `npm run build`                                | Pass, with Vite future-config, mixed dynamic-import, and large-chunk warnings                   |
| `npm test -- --reporter=dot`                   | 287 passed / 1 timed out; React `act(...)` warnings remain                                      |
| Isolated retry of failed OTP registration test | Pass (1/1); classify the suite failure as a timing flake, not a confirmed functional regression |

### Backend

| Check                          | Result                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `dotnet restore AIFitness.sln` | Pass from available cache; NU1900 warnings because NuGet vulnerability metadata was unreachable                       |
| `dotnet build AIFitness.sln`   | Pass: 0 errors, 4 NU1900 warnings                                                                                     |
| Unit tests                     | Pass: 212/212                                                                                                         |
| Integration tests              | 28 passed, 5 skipped, 111 failed before product execution because Testcontainers could not access Docker              |
| Docker availability            | Not available/authorized on the host pipe; integration result is environment-blocked, not product acceptance evidence |

The skipped tests include live-provider/video scenarios. The integration suite must be rerun with PostgreSQL/Testcontainers and required media/provider credentials before release.

### Mobile

| Check                     | Result                                                                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --ignore-scripts` | Pass                                                                                                                                                                              |
| `npm run lint`            | Pass                                                                                                                                                                              |
| Unit tests                | 200 total: 197 passed, 3 skipped                                                                                                                                                  |
| UI integration tests      | Pass: 129/129                                                                                                                                                                     |
| Total automated tests     | 329 total: 326 passed, 3 skipped                                                                                                                                                  |
| Expo Web export           | Pass; output bundle generated and inspected, then removed as an audit artifact                                                                                                    |
| `npm run typecheck`       | **Fail**: `ConfiguredCaptureScreen.tsx:879` missing `onInitialized` and implicit-`any` callback parameter; `SynchronizedSquatCaptureScreen.tsx:588` missing required `video` prop |

### Evidence scale

- **E0** — no implementation evidence.
- **E1** — code/API/schema evidence only.
- **E2** — automated unit/component/contract evidence.
- **E3** — built or executed in an environment approximating production.
- **E4** — end-to-end business acceptance with real dependencies, roles, data, devices/providers, and negative cases.

Build success never upgrades an unexecuted business workflow to E4.

## C. SRS Traceability Matrix

### Layer-by-layer summary

| Requirement / flow                                                 | Web                                             | Mobile                                       | Backend                                               | Database                                                                     | AI / External                                     | Status                 | Evidence                                                                                      | Principal gap                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| FR-SH-01..05 shared identity, scope, admin, notifications, clients | Broad actor UI; auth/session tests              | Auth and actor screens                       | Identity, invitations, roles, notifications           | User/role/audit entities                                                     | N/A                                               | Partial                | E1–E3                                                                                         | Role naming and object/tenant-scope consistency; some UI is mock/sample-driven               |
| FR-SH-06, BR-27 account deletion/privacy lifecycle                 | Missing                                         | Missing                                      | Missing                                               | No deletion lifecycle/state                                                  | Sensitive AI/video/provider data not orchestrated | **Missing**            | E0/absence search                                                                             | Confirmation, state transition, anonymization/deletion, retention and no-restore behavior    |
| CF01 BF01–BF03 AI coaching/plans                                   | Profile/plan/assistant UI                       | Member coaching/assistant UI                 | Profiles, requests, proposals, plans, assistant tools | Versioned plans, proposals, RAG/vector records                               | LLM abstraction, RAG and tool calling             | Partial / contradicted | E1–E2                                                                                         | Legacy quotas, no `MemberAiPass` execution gate, no CF05 weekly/two-stage proposal lifecycle |
| CF02 BF01 Admin references                                         | Admin Studio/reference UI                       | N/A                                          | Upload/job/review/confirm/activate APIs               | Versioned references/config/evidence                                         | Video/pose processing pipeline                    | Partial                | E1–E2; live blocked                                                                           | Live model/media acceptance and complete reference catalog                                   |
| CF02 BF02 realtime camera                                          | N/A                                             | MediaPipe/squat capture and cues             | Runtime/config/reference APIs                         | Runtime/reference configuration                                              | On-device pose inference                          | Partial                | E2; Mobile build gate fails                                                                   | Type errors, exercise breadth and real-device validation                                     |
| CF02 BF03 post-session assessment                                  | History/review surfaces                         | Capture/upload/history/results               | Assessment pipeline/status/result APIs                | Assessment, rep/phase/evidence persistence                                   | Video normalization/evaluation                    | Partial                | E1–E2; live blocked                                                                           | End-to-end media run, entitlement and accepted Trainer access                                |
| CF03 BF01–BF03 organization/discovery/membership                   | Gym admin/discovery plus legacy marketplace     | Discovery/marketplace surfaces               | Organization/Branch/membership plus legacy orders     | Both membership and old order/enrollment models                              | N/A                                               | Partial / contradicted | Old member-to-Gym commerce must be removed; actor scope hardened                              |
| CF03 BF04–BF05 Personal/Gym purchase                               | Legacy Plus and newer distribution UI are split | Marketplace payment/result UI                | Separate payment/Plus and agreement/top-up paths      | Plus entitlements beside Member AI Pass/agreement/credit                     | PSP callback foundations                          | Partial / contradicted | One payment-first, idempotent pass model for only allowed FitFlex purchases                   |
| CF03 BF06–BF08 distribute/accept/lifecycle/review                  | New pass distribution pages exist               | Limited member offer/pass surfaces           | Catalog/inventory/program/offer/pass services         | New pass entities/migration, insufficient uniqueness/concurrency constraints | N/A                                               | Partial / fail         | Tenant binding, transaction/idempotency, one-active-pass invariant, lifecycle/review coverage |
| CF04 BF01–BF02 assignment/PT plan                                  | Trainer/admin workspaces                        | Trainer/member surfaces                      | Assignment and plan-access services                   | Assignment/history/permission fields                                         | AI proposal relationship                          | Partial                | E1–E2                                                                                         | Gym manager ownership, explicit wellness consent and Trainer-first proposal workflow         |
| CF04 BF03–BF05 sessions/change Trainer                             | Appointment screens/tests                       | Appointment/trainer flows                    | Scheduling, reschedule, no-show, trainer-change       | Session status lacks required states; PT counters remain                     | N/A                                               | **Contradicted**       | Confirmation/dispute state machine and removal of PT-package accounting                       |
| CF05 BF01 logging                                                  | Workout schedule/log UI                         | Workout/progress UI                          | Workout/progression recording                         | Workout/progression events                                                   | N/A                                               | Partial                | Accepted weekly evidence pipeline                                                             |
| CF05 BF02 weekly adaptation                                        | Mock-heavy/limited progression UI               | Limited proposal UX                          | No SRS weekly proposal aggregate                      | No evidence/proposal lifecycle schema                                        | No accepted evaluator                             | **Missing/partial**    | Thresholds, insufficient data, evidence_as_of, review/reminders/supersession/handover         |
| CF05 BF03–BF05 gamification/recovery                               | Progress/recovery UI                            | Progress/recovery UI                         | XP, badges, streak, schedule, recovery, pause/resume  | Progression/recovery entities                                                | CF06 input not canonically reconciled             | Partial                | E1–E2                                                                                         | Consent, decay/pause policy, challenge provenance and cross-flow acceptance                  |
| CF06 BF01–BF02 connect/import                                      | N/A                                             | Health Connect/Strava connection and sync UI | OAuth/import/sync/history/delete APIs                 | Connection/sync/activity entities                                            | Strava OAuth/API; Health Connect bridge           | Partial                | E2; real provider blocked                                                                     | Real-device/provider acceptance, retry/partial failure proof                                 |
| CF06 BF03–BF04 reconcile/manage                                    | N/A                                             | History/disconnect/delete UI                 | Exact source-ID upsert and provider delete            | Unique provider + external ID                                                | HealthKit absent                                  | Partial / fail         | Cross-provider canonical activity and progression/XP/challenge recomputation                  |
| BR-26 paid execution enforcement                                   | UI access is not sufficient                     | UI access is not sufficient                  | New pass not enforced in execution handlers           | Pass and legacy entitlement coexist                                          | Paid AI/runtime calls affected                    | **Fail**               | Enforce one entitlement service inside each paid operation                                    |
| NFR-01..11                                                         | Lint/typecheck/build pass; one flaky test       | Lint/tests/export pass; typecheck fails      | Build/unit pass; integration environment-blocked      | Migration/schema inspection only                                             | Live media/provider/load evidence absent          | Partial / blocked      | Security negatives, idempotency, privacy deletion, observability, load and live integrations  |

### Shared capabilities

| Requirement                   | Status          | Evidence and gap                                                                                                                                                                                                                                                         |
| ----------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-SH-01 Identity             | Partial, E2/E3  | Registration, OTP, refresh/session handling, invitations and Gym registration exist. Role naming mixes `SuperAdmin`, `Admin`, and SRS `Platform Admin`; full actor lifecycle acceptance was not executed.                                                                |
| FR-SH-02 Authorization/scope  | **Fail**, E1/E2 | Several domains perform object-level checks, but `GymPassDistributionController` accepts arbitrary `gymId` and optional `branchId`; corresponding service methods do not consistently receive the actor. Negative cross-tenant tests are absent for the new pass domain. |
| FR-SH-03 Administration/audit | Partial, E1/E2  | Auditable entities and admin controllers exist; sensitive pass/session workflows do not uniformly capture actor/reason/state transitions required by v2.4.4.                                                                                                             |
| FR-SH-04 Notifications        | Partial, E1     | Notification calls exist around appointments and other flows. Failure isolation and exhaustive event coverage were not demonstrated.                                                                                                                                     |
| FR-SH-05 Web/mobile surfaces  | Partial, E2/E3  | Broad UI coverage exists. Some screens are mock/sample-driven; Mobile typecheck fails.                                                                                                                                                                                   |
| FR-SH-06 Account deletion     | **Missing, E0** | No `DeletionRequested` state, confirmation workflow, anonymization orchestration, no-restore policy, or retention execution was found. Existing generic soft-delete helpers do not satisfy this requirement.                                                             |

## D. Core Flow Assessments

The following six assessments combine the expected end-to-end SRS behavior, located implementation, executed or blocked evidence, gaps, dependencies, and the remediation direction. No flow is marked complete solely because its code surface exists.

### CF01 — AI coaching and plans

| Requirement group                                                 | Status                            | Evidence and gap                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-CF01-01..04 profile, generation, structured result, versioning | Partial, E2                       | Fitness/training/nutrition profiles, queued coaching requests, structured proposals, plan versions, AI provider abstraction, RAG/vector knowledge, citations, and assistant tools exist. Integration execution is Docker-blocked.                |
| FR-CF01-05..07 completion history and proposal source/review      | **Partial / contradicted**, E1/E2 | Workout plans/logging and proposal persistence exist. `ProposalStatus` is only `Pending/Applied/Dismissed`; no CF05 weekly evidence lifecycle, Trainer-first approval state, `evidence_as_of`, or handover supersession exists.                  |
| BR-05 / BR-21 / BR-26                                             | **Fail**                          | Apply access has useful assigned-Trainer checks, but the active `MemberAiPass` is not the execution gate for CF01/Agent. `MaxRequestsPerDay=10` and `CoachingQuotaExceeded` directly contradict the v2.4.4 removal of commercial request quotas. |

### CF02 — movement reference, realtime guidance, post-session assessment

| Requirement group                                    | Status             | Evidence and gap                                                                                                                                                                                                                  |
| ---------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CF02-01..03, 08 Admin reference lifecycle         | Partial, E2        | Upload, job processing, metadata proposal/review, confirm/activate, reference sets, versioning and evidence endpoints exist with substantial unit/integration test source. Live pipeline execution was blocked.                   |
| FR-CF02-09..12 realtime guidance vs final assessment | Partial, E2        | Mobile MediaPipe capture, synchronized squat state machine, camera guidance, reference-aware cues and recovery/history tests exist. Current component API drift breaks typecheck, and supported-exercise breadth is not accepted. |
| FR-CF02-04..07 post-session assessment/history       | Partial, E2        | Member upload/status/history/result surfaces and Backend pipelines exist. Real video/model/media execution and role-based viewing were not accepted in this environment.                                                          |
| BR-26 / NFR-05 / NFR-11                              | **Partial / fail** | Long-running status and media controls have implementation evidence, but new-pass entitlement at the paid execution endpoint is not demonstrated; live media/device validation and deletion retention are missing.                |

### CF03 — AI commerce, distribution and discovery

| Business function / requirements                     | Status                 | Evidence and gap                                                                                                                                                                                                                                        |
| ---------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BF01 FR-CF03-01..03 Gym/Branch governance            | Partial, E2            | Organization/Branch registration, invitations, roles and approval foundations exist. Scope naming and negative tenant tests require reconciliation.                                                                                                     |
| BF02 FR-CF03-04..06 catalog/snapshots                | Partial, E1/E2         | Pass types, agreements, entitlement snapshots and admin APIs exist. Complete publish/retire behavior and immutable purchase/payment snapshot acceptance are unproven.                                                                                   |
| BF03 FR-CF03-07..09 discovery/membership/affiliation | **Contradicted**       | Discovery and membership concepts exist, but the active marketplace still records Gym/PT checkout, orders, commission, settlement and enrollment, which SRS explicitly excludes.                                                                        |
| BF04 FR-CF03-10..12 Personal purchase/promo          | Partial / fail         | Legacy Plus purchase/payment exists separately from the new pass model. One unified entitlement with pre-checkout replacement confirmation and payment-idempotent activation is not demonstrated.                                                       |
| BF05 FR-CF03-13..16 Agreement/top-up                 | Partial / fail         | Agreement, batch and top-up entities/APIs exist. Current create/top-up paths can materialize credits from request data without an accepted payment callback lifecycle.                                                                                  |
| BF06 FR-CF03-17..20 inventory/program/offer          | Partial / fail         | Inventory, programs, reservation, expiry and offer APIs exist. Actor scope can be caller-selected; no demonstrated row-lock/idempotency design covers concurrent reservation and retry.                                                                 |
| BF07 FR-CF03-21..23 accept/replace                   | Partial / fail         | Replacement warning/confirmation and pass/credit transitions exist in service code and five unit tests. There is no unique filtered database invariant for one Active pass, no idempotency key on activation, and no accepted concurrent/rollback test. |
| BF08 FR-CF03-24..27 lifecycle/report/review          | Partial / contradicted | Some histories and moderation exist, but review eligibility remains tied to legacy marketplace/session semantics; suspension/termination and confirmed-session review behavior are incomplete.                                                          |

### CF04 — Trainer interaction and sessions

| Requirement group                                     | Status                  | Evidence and gap                                                                                                                                                                                                                                                       |
| ----------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CF04-01..04 assignment, plan, consent/handover     | Partial, E1/E2          | Assignment history, trainer change, plan management and permission fields exist. Core assignment create/end routes are `SuperAdmin`-only rather than the Gym Admin/Branch Manager workflow; wellness consent is not comprehensively demonstrated.                      |
| FR-CF04-05, 06, 10 session lifecycle                  | **Fail / contradicted** | `AppointmentStatus` lacks `AwaitingMemberConfirmation` and a session `Disputed` state. Trainer `complete` directly sets `Completed` and calls `ConsumeSession`. Member confirmation, timeout distinction, manager dispute resolution and decision feedback are absent. |
| FR-CF04-07..09 reschedule/substitution/change Trainer | Partial, E2             | Proposal, confirmation, reschedule, no-show, make-up, trainer-change and notification foundations exist. Full scoped manager acceptance and handover effects on pending plan proposals are incomplete.                                                                 |
| BR-07 / BR-08                                         | **Fail**                | `CoachingAssignment.TotalSessions/SessionsUsed`, remaining quota checks and order-derived session counts explicitly account for PT packages inside FitFlex.                                                                                                            |

### CF05 — progression, gamification and recovery

| Requirement group                                              | Status              | Evidence and gap                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BF01 logging/adherence (FR-CF05-01, 02 and related)            | Partial, E2         | Workout logging/history and business-day controls exist; end-to-end evidence feeding weekly progression was not demonstrated.                                                                                                                                              |
| BF02 weekly progression proposals (FR-CF05-08..10, 12..26, 32) | **Missing/partial** | No weekly evaluation/proposal aggregate, per-goal threshold decision, `insufficient_data`, `evidence_as_of`, pending-review reminders, revised/superseded proposal, or `superseded_by_handover` implementation was found. Existing progression state is not this workflow. |
| BF03 XP/level/achievement (FR-CF05-03, 04, 27, 28)             | Partial, E2         | XP awards, levels, streak/badges and rule tests exist. Cross-source dedupe/recalculation and accepted decay/pause policies remain incomplete.                                                                                                                              |
| BF04 challenge/quest/share (FR-CF05-05, 06, 29)                | Partial, E1/E2      | Engagement/challenge foundations exist; provenance-aware reconciled CF06 input and sharing/provider-term acceptance were not demonstrated.                                                                                                                                 |
| BF05 recovery/pause (FR-CF05-07, 11, 30, 31)                   | Partial, E2         | Member recovery reports, pause/resume and Trainer resume proposal exist. Fine-grained wellness consent and pause effects across adherence/streak/proposal evaluation need acceptance tests.                                                                                |

### CF06 — external fitness

| Requirement group                                   | Status             | Evidence and gap                                                                                                                                                                                                           |
| --------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-CF06-01..04 consent/connect/import/retry/history | Partial, E2        | Strava OAuth with protected tokens and Health Connect import/history/delete paths exist. Sync state records partial results. Real credentials/device execution was not available.                                          |
| FR-CF06-05 canonical reconciliation/provenance      | **Partial / fail** | Import dedupe groups by `ExternalRecordId` within a provider and the DB key preserves provider provenance. There is no canonical activity linking equivalent records across providers.                                     |
| FR-CF06-06 downstream recalculation                 | **Missing**        | Delete/update can change imported rows, but no demonstrated recomputation of progression, XP or challenges was found.                                                                                                      |
| FR-CF06-07 disconnect/delete                        | Partial, E2        | Strava disconnect and provider-data hard-delete APIs/screens exist. Account-deletion orchestration and retention policy are missing.                                                                                       |
| Connector acceptance                                | Not accepted       | Health Connect and Strava code/automated tests exist; HealthKit was not found. SRS makes connector scope conditional, but at least one real connector must pass a device/provider acceptance run before claiming complete. |

### Cross-cutting Business Rules and NFRs

| Requirements                                              | Verdict                                                                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01, BR-02, NFR-01 tenant/object scope                  | **Fail until negative-tested**: new Gym distribution routes do not consistently bind actor scope.                                                              |
| BR-03, BR-10, BR-15..19, BR-22, BR-24..26; NFR-04, NFR-06 | **Partial/fail**: snapshots and state objects exist, but payment/idempotency/concurrency/unique-active-pass/execution-entitlement invariants are not complete. |
| BR-05, BR-20, BR-21                                       | Partial/fail: assigned-Trainer access exists; complete consent, Trainer-AI agreement entitlement, and two-stage plan decision are not accepted.                |
| BR-07..09                                                 | **Contradicted** by marketplace orders, commission, settlement, wallet/payout and PT-session consumption.                                                      |
| BR-11                                                     | Partial/fail: eligibility must be rebuilt around active membership/affiliation and the v2.4.4 confirmed Session lifecycle.                                     |
| BR-12, BR-13                                              | Partial: source provenance/exact dedupe and progression rules exist; canonical reconciliation and downstream recomputation are missing.                        |
| BR-14, NFR-10                                             | Partial: broad audit/job infrastructure exists; sensitive new pass/session/deletion transitions and operational monitoring are incomplete.                     |
| BR-23                                                     | Partial: safety wording/validation exists in AI/movement areas; end-to-end content acceptance was not performed.                                               |
| BR-27, NFR-03, NFR-11                                     | **Fail**: no account deletion/retention orchestration.                                                                                                         |
| NFR-02                                                    | Partial: token protection/auth foundations exist; deployment secret/TLS/log verification was outside local evidence.                                           |
| NFR-05                                                    | Partial: job/sync states and retry patterns exist; live video/provider paths are unverified.                                                                   |
| NFR-07                                                    | Partial: responsive Web/Mobile implementations and tests exist; Mobile typecheck failure blocks release.                                                       |
| NFR-08                                                    | Partial/pass at design level: providers/modules are generally separated, but the stale dual commercial domains substantially increase coupling and ambiguity.  |
| NFR-09                                                    | Not accepted: no current load-test dataset, percentile, machine profile, and error-rate evidence was supplied.                                                 |

## E. Confirmed contradictions and requirement ambiguities

### Code vs SRS contradictions

1. **Gym money flow:** Backend `Order`, `SettlementLedgerEntry`, wallet/withdrawal services and payout worker; Web settlement/payout routes and 10% commission UI; and Mobile trainer-income/payout screens contradict the explicit no-Gym-payment boundary.
2. **Commercial quota:** `Coaching:MaxRequestsPerDay`, `CoachingQuotaExceeded`, `QuotaLimited`, free monthly quotas, and Plus entitlements contradict section 11.3 and BR-26’s pass entitlement model.
3. **PT package accounting:** total/used/remaining sessions and `ConsumeSession` contradict FR-CF04-06 and BR-08.
4. **Session confirmation:** immediate `Completed` on Trainer action contradicts FR-CF04-10 and the section 6.1 state machine.
5. **Account deletion:** current user states have Active/Disabled/PendingApproval/Rejected, but no deletion lifecycle required by FR-SH-06.

### SRS governance/parameter ambiguities

1. The document calls itself **DRAFT** and says it does not automatically replace v2.4.0. This audit uses it as authoritative only because the audit request explicitly instructs that treatment. Product governance should formally ratify the baseline.
2. P-01 and P-02 are examples/defaults and P-04/P-05 are unresolved; release behavior cannot be accepted until owners and concrete values are approved.
3. The parameter list skips P-03. This is a documentation numbering gap, not an inferred product requirement.
4. Refund rules are named for the three allowed FitFlex payment families, but operational refund timing, partial-refund behavior, and PSP reconciliation rules are not sufficiently specified for financial acceptance.
5. HealthKit is conditional on the connector decision/POC; the team must record which connector(s) form the release acceptance target.
6. Map SRS “Platform Admin” to one canonical runtime role. Current use of `SuperAdmin` and `Admin` is inconsistent enough to create authorization ambiguity.

## F. Remediation backlog and merge readiness

### P0 — block business acceptance

| ID    | Repositories         | Remediation and required proof                                                                                                                                                                                                                                                                                                                                                   |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0-01 | Backend, Web, Mobile | Retire or feature-disable the legacy Gym marketplace money flow: checkout/order/enrollment-as-purchase, 10% commission, settlement ledger, wallet, withdrawals, payout worker and corresponding UI/copy. Preserve only Gym discovery/membership/affiliation and the three allowed FitFlex payment families. Add negative tests proving Gym/PT payment endpoints are unavailable. |
| P0-02 | Backend + clients    | Make `MemberAiPass` the single Member paid-feature entitlement and enforce it inside CF01, CF02, Agent, paid CF05 and paid CF06 execution handlers. Remove commercial per-call/monthly quotas. Test expired/replaced/revoked/wrong-member passes and direct API bypass.                                                                                                          |
| P0-03 | Backend + Web/Mobile | Implement FR-SH-06: confirmed deletion request, access shutdown, `DeletionRequested → Deleted`, sensitive-data deletion/anonymization jobs, auditable retained records, no automatic relationship/pass restoration, status UI and failure recovery.                                                                                                                              |
| P0-04 | Backend              | Bind every Gym distribution operation to authenticated Organization/Branch scope; do not trust route/query scope alone. Add cross-tenant and Branch Manager negative tests for read and write paths.                                                                                                                                                                             |
| P0-05 | Backend              | Put offer reserve/accept/decline/cancel/expiry and pass replacement in explicit transactions with idempotency keys, concurrency tokens/locks, and database invariants (including a unique filtered active-pass constraint). Add parallel retry/rollback tests.                                                                                                                   |
| P0-06 | Backend, Web, Mobile | Replace CF04 states/commands with the v2.4.4 confirmation/no-show/dispute state machine; remove PT package decrement/remaining quota; add manager-scoped dispute resolution, audit and Member feedback.                                                                                                                                                                          |
| P0-07 | Mobile               | Repair the two MediaPipe prop contracts and require lint + typecheck + tests + platform build/export in CI.                                                                                                                                                                                                                                                                      |

### P1 — required for Core Flow completion

| ID    | Repositories      | Remediation and required proof                                                                                                                                                                                     |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1-01 | Backend + clients | Implement CF05 weekly per-goal evaluation, thresholds, `insufficient_data`, recovery rules, evidence snapshot/`evidence_as_of`, Trainer/Member review, reminders, revision/supersession and handover invalidation. |
| P1-02 | Backend           | Unify CF01 proposals with CF05 and CF04 decision states; preserve manual changes while enforcing Trainer-first review for assigned Members.                                                                        |
| P1-03 | Backend + Web     | Complete payment-first activation for Personal Package, Gym Agreement and Top-up with idempotent callback/refund/reconciliation; snapshot catalog terms.                                                           |
| P1-04 | Backend + Mobile  | Add canonical cross-provider activity reconciliation and recompute/reverse progression, XP and challenge effects on update/delete.                                                                                 |
| P1-05 | Backend + clients | Rebuild Gym/Branch/Trainer review eligibility on active membership/affiliation and v2.4.4-confirmed Sessions.                                                                                                      |
| P1-06 | All               | Rerun the complete Backend integration suite with Docker/PostgreSQL, live CF02 media pipeline, one real Health Connect/Strava device/provider path, and all role/tenant negative cases.                            |

### P2 — hardening and governance

- Ratify SRS 2.4.4 and resolve P-01/P-02/P-04/P-05, refund policy, connector target, and canonical role names.
- Fix the Web full-suite timing flake and React `act(...)` warnings; budget/split large chunks and update Vite config semantics.
- Add measured NFR-09 load evidence and NFR-10 dashboards/alerts for payments, pass transitions, assessment jobs, sync, deletion and authorization denials.
- Close or supersede Web PR #8 after confirming its useful optional-workout behavior is already represented or separately reimplemented on current `main`.

### Merge readiness by repository

| Repository | Audit branch readiness                                                                                           | Product release readiness                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Web        | Ready to publish the fast-forwarded baseline plus this evidence-only report; no product integration was selected | No-go: legacy commercial UI remains and full test suite is flaky once                         |
| Backend    | Ready to publish the fast-forwarded baseline; build/unit tests pass                                              | No-go: P0 business/security/state blockers and Docker-blocked integration suite               |
| Mobile     | Ready to publish the fast-forwarded baseline                                                                     | No-go: typecheck failure, legacy payment/payout surfaces, no real-device connector acceptance |

## Audit limitations

- This was a source, schema, branch/PR, build and automated-test audit. No production data or production deployment was modified.
- Docker/Testcontainers, real payment PSP callbacks, real AI-provider calls, real CF02 video processing, and real Health Connect/Strava credentials/devices were unavailable; those flows remain unverified rather than presumed working.
- Absence findings are based on repository-wide search plus relevant controller/service/entity/schema inspection. They should be converted into executable negative/contract tests during remediation.
- Existing user worktrees and uncommitted files were left untouched; the audit used isolated clones.
