# Architecture understanding: app-jee-exam + app-jee-exam-admin

## Context

The user asked me to read through `app-jee-exam` (the NTA CBT replica that JEE Main candidates use to take a test) and `app-jee-exam-admin` (the tool used to author/configure those tests) and report back on the design patterns involved. This is a pure research/read task — no code changes requested. This document *is* the deliverable: a structured explanation of how the two apps are built and how they connect, grounded in file paths and code I verified directly (plus three parallel Explore-agent passes over each app and their shared libraries).

No implementation follows this document unless the user asks for changes based on it.

## Workspace shape

Single Angular CLI workspace at `/Users/sandeep/projects/sconsole/SConsoleNxtUI`, multiple sibling `projects/`:

- `app-jee-exam` — the exam-taking app (candidate-facing)
- `app-jee-exam-admin` — the test-authoring app (admin-facing)
- `app-jee-common` — **shared source tree** (not an ng-packagr library) of JEE-domain models, services, and widgets, aliased as `@jee-common/*` → `./projects/app-jee-common/src/*` in the root `tsconfig.json`
- `lib-core` — a real Angular library (has `ng-package.json`, built to `dist/lib-core`) of generic, JEE-agnostic UI shell/infra: `RemoteService`, `PageHeader`/`PageToolbar`/`PageTitle`, `FeatureMenubar`, `ModalWait`, `AlertsDisplay`
- `app-jee-mdm` — separate master-data app (topics/syllabus/problem bank), also consumes `@jee-common` and `lib-core`
- `app-jee-monitor`, `app-jee-ctrl-screens` — separate live-monitoring apps (websocket/STOMP), not used by exam/admin directly

Both `app-jee-exam` and `app-jee-exam-admin` have `tsconfig.app.json` that just `extends: "../../tsconfig.json"`, inheriting the `@jee-common/*` alias — there's no npm-workspaces/package boundary, it's literally shared source. Notably `app-jee-common/src/services/jee-base.service.ts` imports `ExamQuestion`/`ExamSection` back from `app-jee-exam/src/common/so-wrappers` (confirmed at `jee-base.service.ts:9`) — the "shared common" library reaches into one specific app's source, so it isn't truly app-agnostic despite being consumed by both.

## The shared domain model (the contract between admin and exam)

Defined once in `app-jee-common/src/util/exam-data-types.ts` and used unmodified by both apps:

```
ExamSO (the "Test"/"Paper")
 ├─ state: string            "DRAFT" | "PUBLISHED"  (free string, not an enum)
 ├─ type: "MAIN" | "ADV"
 ├─ duration (seconds), totalMarks, numPhy/Chem/MathQuestions
 ├─ topics: Record<syllabusName, TopicSO[]>
 └─ sections: ExamSectionSO[]
     ├─ syllabusName, problemType (SCA/MCA/NVT/LCT/MMT/CMT/ART), title
     ├─ correctMarks, wrongPenalty, numQuestions, numCompulsoryQuestions, instructions[]
     └─ questions: ExamQuestionSO[]
         └─ question: QuestionSO { questionImages: QuestionImageSO[], answer, topicId, ... }
```

Questions are **pre-rendered raster images** (scanned/paginated question bank), not rich text/LaTeX — both apps render them the same way: `${apiRoot}/question-img/${sourceId}/${fileName}`. There's no in-app question authoring; `app-jee-exam-admin` only *selects* existing bank questions into sections.

Attempt/evaluation side mirrors the same shape: `ExamAttemptSO → ExamSectionAttemptSO → ExamQuestionAttemptSO`, each carrying `score/loss/avoidableLoss`, used by both the exam app's result screen and the admin app's `exam-analysis` reporting feature.

## Integration pattern: no publish artifact, just a state flag over shared REST

There is no build step, snapshot, versioning, or cache between the two apps — they read/write the **same live backend record** via a shared `ExamApiService` (`app-jee-common/src/services/exam-api.service.ts`), itself built on `lib-core`'s `RemoteService` (generic `HttpClient` wrapper unwrapping a `{executionResult, data}` envelope).

- Admin creates a paper as `state: "DRAFT"` (`POST Master/Exam/`), edits it (`PUT Master/Exam/`, whole-document save — no per-section/per-question endpoints), then "publishes" by literally flipping one field and re-saving:
  ```ts
  // app-jee-exam-admin/src/features/exam-edit/exam-edit.service.ts:112-115
  async publishExamConfig() {
    this.examCfg!.state = "PUBLISHED";
    return this.updateExamConfig();   // same PUT used for every other edit
  }
  ```
  The Publish button is gated by `isConfigComplete()` — every section's `questions.length` must equal its configured `numQuestions`.
- Exam app lists exams (`GET Master/Exam/`) and filters client-side:
  ```ts
  // app-jee-exam/src/features/exam-listing/exam-listing.component.ts
  if (exam.state === "PUBLISHED") availableExams.push(exam);
  ```
  then fetches the full config with the same `GET Master/Exam/{id}` the admin editor uses.

Backend is a single REST server (`environment.apiRoot = http://192.168.0.165:8080`), URL casing (`/Master/Exam/`, `/Exam/AnswerUpdate`) suggests Java/Spring. No Firebase/Firestore anywhere in the frontend (verified via repo-wide grep). A `wsRoot` exists for STOMP websockets but is only used by the separate monitor/ctrl-screens apps — the backend evidently re-broadcasts session lifecycle events (`SESSION_STARTED`, etc.) over STOMP after `app-jee-exam` posts them over REST (`/Session/StartExamSession`, `/Session/ExtendSession`), making `app-jee-monitor` a passive downstream listener with zero coupling from `app-jee-exam` itself.

## app-jee-exam: candidate-facing runtime

**Structure**: standalone components only (no NgModules, `bootstrapApplication` in `main.ts`), no guards/resolvers/models folders — domain types live in `app-jee-common`, data loading happens imperatively in `ngOnInit`.

**Session/state model** — no NgRx, no global store object. `JeeBaseService` (shared base class in `app-jee-common`) holds plain mutable fields (`examConfig`, `sections`, `questions`, `activeQuestion`, `currentLap`, one `signal<number>` for the countdown) and is provided **at the route level** (`providers: [...]` on `jee-main/:examId`), giving each exam attempt a fresh instance — this route-scoping is the closest thing to session scoping in the app. `JeeMainService extends JeeBaseService`, adding app-specific config parsing (`loadExamConfig`).

Questions are threaded into a **doubly linked list** (`ExamQuestion.nextQuestion`/`prevQuestion` in `app-jee-exam/src/common/so-wrappers.ts`) built once at load time from the raw section arrays — prev/next navigation walks pointers, not array indices. All navigation sources (palette click, section tab, prev/next buttons) funnel through one choke point, `JeeBaseService.activateQuestion()`, which persists outgoing time-spent, deactivates the old question, activates the new one, and logs telemetry — a single consistent path regardless of trigger.

**Communication pattern**: components `inject()` the shared service and read/write its fields directly in templates — "service instance as mutable shared state," no RxJS Subjects, no NgRx. `@Input`/`@Output` (via `EventEmitter`) is reserved for the two genuinely reusable answer-input leaf components (`SCAAnswerZoneComponent`, `NVTAnswerZoneComponent`).

**Timer**: single global (not per-section) countdown, a recursive `setTimeout` (not `setInterval`/RxJS `timer`) driving an Angular `signal`, in `JeeBaseService.countdown()` (verified directly, `jee-base.service.ts:112-130`). Every tick also increments the active question's time-spent counters, and every 5th second pings a session keep-alive endpoint. Hitting zero auto-submits. A separate "lap" concept (NTA's L1→L2P→L2→AMR→L3P→L3.1→L3.2 sequence) is advanced independently of the timer via `saveLapSnapshot()`, driven by a fixed `LAP_TRANSITIONS` map.

**Answer capture**: status model `NOT_VISITED → NOT_ANSWERED → ANSWERED`, plus `MARKED_FOR_REVIEW`/`ANS_AND_MARKED_FOR_REVIEW`, mapped 1:1 to palette CSS classes. Every state change (answer edit, save-and-next, mark-for-review, question activation) is synced to the backend **immediately** via REST (`POST /Exam/AnswerUpdate`, `/Exam/TimeUpdate`, `/Exam/LapSnapshot`, `/Exam/EventLog`) — there's no local-only/debounced persistence; the UI is a thin, continuously-syncing client over server state.

**Routing**: two-level nested — `exam-listing` then `jee-main/:examId` with child screens `login-dialog → welcome-screen → instruction-screen → exam-screen → submit-screen → result-screen`, plain relative `router.navigate()` calls, no guards enforcing screen order.

## app-jee-exam-admin: authoring tool

**Structure**: also fully standalone components, no NgModules. Four top-level nav features: `question-repo` (bank coverage dashboard), `question-browser` (search/browse the question bank, read-only), `exam-config` (create-new-test wizard + list), `exam-analysis` (post-hoc attempt reporting). `exam-edit/:examId` is a fifth route reachable only from the exam list — deliberately excluded from primary nav since it's a "detail" screen.

**Creation flow**: a 6-step wizard (`exam-config/exam-setup`) — select type → subjects → sections (from hard-coded `mainSectionTemplates`/`advancedSectionTemplates` carrying NTA's default marking scheme, e.g. SCA 20Q/+4/-1) → configure section question-counts/marks → select topics per subject → configure duration (pre-filled from a per-subject/per-type time table) — sharing state through one route-scoped `ExamSetupService`, finishing with `POST Master/Exam/` as `state: "DRAFT"`.

**Editing flow**: `ExamEditComponent` is a three-pane layout — topic browser (left) → per-section question-selector panels (center, drag-and-drop via `ngx-drag-drop`, shuffle/sort-by-topic) → question image preview (right). Selecting a question just pushes an `ExamQuestionSO` into the in-memory `examCfg` tree; nothing is persisted until the whole-document `PUT Master/Exam/`. Section completeness (`questions.length == numQuestions`) gates both "can I add more questions to this section" and "can I publish."

**State-management pattern**: same as the exam app — no NgRx; every feature (`ExamSetupService`, `ExamEditService`, `QuestionBrowserService`, `QuestionRepoService`) is a route-scoped injectable acting as a de-facto view-model/mini-store, re-instantiated per navigation. A few components use Angular signals with `effect()` (e.g. `QuestionBrowserService.searchResults`), and newer components use signal-based `input()`/`output()` instead of decorators. Forms are template-driven (`[(ngModel)]`) despite `ReactiveFormsModule` being imported in places — appears vestigial.

**Notable inconsistency worth flagging**: `exam-edit/components/question-display` and `question-browser/components/question-display` are two separate, nearly-identical `QuestionDisplayComponent`s duplicating the same image-rendering logic rather than sharing one component from `app-jee-common` — a candidate for consolidation if the user ever wants cleanup, but out of scope here since no changes were requested.

## Cross-cutting patterns common to both apps

1. **Shared domain model + shared REST client, no local DB access** — `app-jee-common` types/`ExamApiService` are the entire contract; publishing is a state-flag PUT, not a build/export/versioning step.
2. **DI-scoped services as the state-management strategy** — no NgRx/Akita anywhere in the workspace; every feature's "store" is just a route-provided `@Injectable()` with plain mutable fields, refreshed by re-navigation.
3. **Standalone components + `bootstrapApplication`** throughout — no NgModules in either app.
4. **Signals used narrowly and locally** (a countdown, a search-results holder) rather than as a general reactive substrate; most template reactivity relies on default Angular change detection reading plain service fields/methods.
5. **`RemoteService` (lib-core) as the uniform HTTP/error/spinner boundary** — every API service in both apps extends it, giving consistent envelope-unwrapping and loading-state UX for free.
6. **Images, not markup, for question content** — both apps treat `QuestionSO.questionImages` identically, avoiding any need for a LaTeX/rich-text rendering pipeline.

## Verification performed

Read `app-jee-common/src/services/jee-base.service.ts` directly and confirmed it matches the exploration agent's report (countdown implementation, `activateQuestion` choke point, lap transition map, `submitExamAttempt` flow). The other cited files (`exam-data-types.ts`, `exam-edit.service.ts`, `exam-listing.component.ts`, `so-wrappers.ts`) were read by the three parallel Explore agents with file/line citations; no further code changes are needed since this is a documentation/understanding request only.
