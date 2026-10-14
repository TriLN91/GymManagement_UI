# FitFlex AI conversational agent — implementation report

Date: 2026-10-14  
Branches: `codex/ai-agent` in backend, web, and mobile repositories

## Delivery summary

The three remote `main` baselines were fetched and verified before work:

- Backend: `2b1d5a4983cb1a7033a612e84ced73b78e2624b2`
- Web: `eba4f27eb8f86206cdbe52ce80a9dc96c5b1d0af`
- Mobile: `929f5295b2a43ca570c8703102219a39b1b578fe`

Implementation commits, all pushed to `origin/codex/ai-agent`:

- Backend: `297bd001bceaa2e0d44be2c3207e6d9781b55c20`
- Web: `d9e5372a61ccef3ea55bdf0c5fd836fcf47b3c7d`
- Mobile: `bbcfaa0828f89a1042f45b6215fa70737f8c5576`

The original working folders were not switched or cleaned. Work was completed in isolated worktrees so the existing web README/report edits and the mobile local changes remained untouched.

## Architecture and responsibilities

The backend has one `AssistantService` orchestrator. It owns conversation isolation, persistence, bounded context construction, tool loops, timeouts, cancellation, idempotency, interaction validation, event ordering, and accounting. `IAssistantModel` is provider-neutral; `OpenAiAssistantModel` uses the existing hardened OpenAI transport. `IAssistantToolRegistry` is an allowlist and fails closed.

The orchestrator submits at most 12 recent messages and at most four tool iterations by default. It never submits the full conversation by default. Provider failures and timeouts become persisted terminal run states with safe client messages and correlation IDs.

The API provides ordered, replayable events over authenticated SSE for web. The mobile app polls persisted run status and restores the authoritative conversation because native Expo support must not be inferred from browser `EventSource` behavior.

## Business tools

| Tool | Application boundary | Authorization and bounds | Status |
|---|---|---|---|
| `get_my_profile` | `ICf01Service.GetProfileAsync` | Authenticated actor; no member ID argument | PASS |
| `get_current_training_plan` | `ICf01Service.GetPlansAsync` | Authenticated actor; active plans only, at most three per domain | PASS |
| `search_exercises` | `ICf01Service.GetExercisesAsync` | Validated 1–120 character query; at most 20 results | PASS |
| `get_my_assessments` | `IMovementAssessmentService.ListOwnedAsync` | Actor user ID supplied on server; optional UUID filter; at most 20 results | PASS |
| `search_approved_knowledge` | `IKnowledgeService.RetrieveAsync` | Only `workout`/`nutrition`; query max 300; at most eight published results | PASS |

Tools are read-only. Tool audit records store tool name, validated arguments, status, duration, error code, and result byte count. Personal tool result payloads are not copied into audit rows. Future write tools must use explicit confirmation, reauthorization at confirmation time, idempotency, and resource audit; payment, OAuth, and account administration tools are not implemented.

## API and interaction schemas

Endpoints:

- `POST/GET /api/assistant/conversations`
- `GET/DELETE /api/assistant/conversations/{conversationId}`
- `POST /api/assistant/conversations/{conversationId}/messages`
- `POST /api/assistant/conversations/{conversationId}/interactions/{messageId}/submit`
- `GET /api/assistant/conversations/{conversationId}/runs/{runId}`
- `GET /api/assistant/conversations/{conversationId}/runs/{runId}/events`
- `POST /api/assistant/conversations/{conversationId}/runs/{runId}/cancel`

Event order is persisted with monotonic sequence numbers. Events are `run.started`, `message.delta`, `message.completed`, `tool.started`, `tool.completed`, `interaction.required`, `run.failed`, `run.cancelled`, and `run.completed`. One terminal event is emitted. Clients can pass `after` to replay from a known sequence and fall back to run/history reads.

Protocol v1 allowlists `single_choice`, `multiple_choice`, `form`, `data_card`, `progress`, and `error`. Forms allow text, number, select, and boolean controls. The backend validates option membership, selection counts, required fields, numeric bounds, sizes, duplicate state, and protocol version. The canonical JSON schema is in the backend at `docs/contracts/assistant-interaction-v1.schema.json`.

## Database changes

Migration `20261014162148_AssistantConversations` adds:

- `assistant_conversations`
- `assistant_messages`
- `assistant_runs`
- `assistant_tool_executions`

Constraints cover conversation/message client IDs and conversation/run idempotency keys. Ownership is keyed to the authenticated Member user. Conversations are soft deletable, have configured expiry, are filtered after expiry, and are permanently removed by the daily cleanup. Interaction request/response state, run failure state, event logs, tool execution metadata, token counts, estimated cost, and correlation IDs persist.

## Web integration

The Member portal has a lazy `/app/assistant` route and sidebar entry. It includes conversation list/history restoration, responsive chat, authenticated SSE parsing, run recovery, progressive state, cancel/retry, and declarative interaction rendering. No provider code is evaluated. The assistant bundle remains a separate lazy chunk.

Status: PASS for lint, typecheck, 180-test suite, interaction renderer tests, and production build.

## Mobile integration

The Member Coach stack links to a native `AssistantChat` screen. It uses the existing authenticated API client, restores conversation history, renders choices/forms/data cards, handles keyboard and safe areas, polls runs with a bounded timeout, and supports cancellation.

Status: PASS for lint, typecheck, 88-test suite, navigation ownership, and assistant contract parsers.

## Demonstration scenarios

| Scenario | Implemented behavior | Validation |
|---|---|---|
| A — personalize | Dynamic goal choice, then routine form, then completion message; every step persists and duplicate submission is rejected/idempotent | Automated round-trip test implemented; database execution BLOCKED by unavailable Docker daemon |
| B — current plan | Orchestrator executes `get_current_training_plan` and returns a real account-backed data card or truthful empty collections | Tool implementation/unit boundaries PASS; live API/database E2E BLOCKED |
| C — grounded guidance | Orchestrator retrieves approved knowledge, returns evidence/citations in a read-only card, and refuses to fabricate when retrieval is unavailable | Tool validation PASS; live seeded-corpus E2E BLOCKED |

The real OpenAI adapter is supported when `OPENAI_API_KEY` or `AI:OpenAiApiKey` is configured. No credential was available for this run; live-provider validation is NOT RUN. The three delivery scenarios deliberately have safe deterministic orchestration paths and do not require a production mock.

## Validation evidence

| Check | Result | Evidence |
|---|---|---|
| Backend solution build | PASS | 0 warnings, 0 errors |
| Backend unit tests | PASS | 74/74 |
| EF pending model changes | PASS | No changes since migration |
| Assistant PostgreSQL integration tests | BLOCKED | Tests compile; Docker service is stopped and cannot be started under current service permissions |
| Existing backend PostgreSQL integration suite | NOT RUN | Same Docker blocker |
| Web lint/typecheck | PASS | zero warnings/errors |
| Web tests | PASS | 180/180 across 54 files |
| Web production build | PASS | Vite build completed; assistant emitted as lazy chunk |
| Mobile lint/typecheck | PASS | zero errors |
| Mobile tests | PASS | 88/88 |
| Live OpenAI smoke | NOT RUN | No configured credential; no claim of live validation |
| Browser/native real-API walkthrough | BLOCKED | No running backend/PostgreSQL environment |

## Deferred work and risks

- The OpenAI adapter currently emits one completed `message.delta`; true token-level streaming can be added inside the provider adapter without changing the event contract.
- A running PostgreSQL/pgvector environment is still required to execute ownership, persistence, duplicate-submission, and loop-limit integration tests.
- Production model pricing must be updated when the configured model or provider pricing changes.
- Interaction TypeScript models are mirrored from the canonical backend schema and guarded by client contract tests; generated clients should replace mirroring when the repository adopts OpenAPI generation.
- Branches are pushed but not merged. Merge must go through each repository's required review/check workflow; no force push or branch-protection bypass was attempted.

## Outcome labels

- Implementation and static/unit validation: **PASS**
- Database-backed integration execution: **BLOCKED**
- Live-provider smoke: **NOT RUN**
- Merge to `main`: **NOT RUN** pending authorized repository review/checks
