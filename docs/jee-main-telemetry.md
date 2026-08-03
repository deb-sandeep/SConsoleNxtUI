# jee-main CBT telemetry emit points

Inventory of every place the `jee-main` feature tree (`projects/app-jee-exam/src/features/jee-main/`)
causes a telemetry event to be posted to the server, and what triggers each one.

## How telemetry works

`EventLogService` (`projects/app-jee-common/src/services/event-log.service.ts`) is the single
emission point for exam telemetry. Each public method builds an `ExamEvent` via `createEvent()`
(sequence number, elapsed `timeMarker` since `startTime`, JSON `payload`) and posts it through
`ExamApiService.logEvent()` to `POST ${apiRoot}/Exam/EventLog`. Every event name is mapped to an
`ExamEventType` category via `EVENT_TYPE_MAP`: `ANS_ACTION`, `QUESTION_NAV`, `UI_INTERACTION`,
`START_STOP`, `LAP`, `Q_ACTIVATION`.

`EventLogService` is registered as a **route-level provider**, separately for `jee-main/:examId`
and `jee-advanced/:examId` (`projects/app-jee-exam/src/routes.ts:29-46`). Each route gets its own
service instance, but the code that calls it in `JeeBaseService` is shared by both trees — so some
of the emit points below are not jee-main-exclusive even though they fire during jee-main sessions.

`examAttemptId` and `startTime` are set exactly once, in `JeeBaseService.createExamAttempt()`
(`projects/app-jee-common/src/services/jee-base.service.ts:118-121`), immediately before
`EXAM_START` is logged:

```ts
this.eventLogService.examAttemptId = res.examAttemptId ;
this.eventLogService.startTime = new Date() ;
this.eventLogService.logExamStartEvent() ;
```

## Shared emit points (`jee-base.service.ts`)

These fire identically for jee-main and jee-advanced, since both `JeeMainService` and
`JeeAdvancedService` extend `JeeBaseService`.

| Event | Method / line | Trigger | Gating |
|---|---|---|---|
| `QUESTION_ACTIVATED` | `activateQuestion()` — `jee-base.service.ts:81` | Any question navigation: palette click, next/prev, section jump, or the initial question on exam start | `if (this.activeQuestion == examQuestion) return;` (line 69) — only fires when the target question differs from the currently active one |
| `EXAM_START` | `createExamAttempt()` — `jee-base.service.ts:121` | Fires once, right after the server confirms exam-attempt creation (user proceeds past the instructions screen) | Unconditional on success of `apiSvc.createExamAttempt()` |
| `LAP_CHANGE` | `saveLapSnapshot()` — `jee-base.service.ts:176` | "Start Next Lap" button click, or as part of final submission | Unconditional whenever `saveLapSnapshot()` runs; `nextLap` payload field is `null` on the final lap (`L3.2`) |
| `EXAM_SUBMIT` | `submitExamAttempt()` — `jee-base.service.ts:192` (awaited) | User confirms submission, or the countdown timer reaches zero and auto-submits (`countdown()`, lines 144-147) | `if (this.examSubmitted) return;` at the top of the method — fires once per attempt |

## jee-main-exclusive emit points

All paths below are under `projects/app-jee-exam/src/features/jee-main/pages/04-exam-screen/`.

### `exam-screen.component.ts` (`ExamScreenComponent`)

- **Line 43**: `logPaletteToggle(this.paletteCollapsed)` → `PALETTE_COLLAPSED` / `PALETTE_EXPANDED`
  - Called from `togglePalette()` (lines 41-44), bound to the palette collapse/expand toggle button.
  - Unconditional — every click flips `paletteCollapsed` and logs the resulting state.

### `section-header/section-header.component.ts` (`SectionHeaderComponent`)

- **Line 18**: `logJumpSection(section)` → `GOTO_SECTION_START`
  - Called from `jumpToSection(section)` (lines 17-20), bound to the subject/section tab buttons
    (e.g. Physics/Chemistry/Maths).
  - Logged unconditionally, immediately before `examSvc.activateQuestion(section.firstQuestion)`
    (which separately triggers `QUESTION_ACTIVATED` unless that question is already active).

### `question-display/question-display.component.ts` (`QuestionDisplayComponent`)

- **Line 36**: `logScrollQuestion(activeQuestion, 'UP')` → `SCROLL_QUESTION_UP`
  - From `scrollUp()` (lines 35-41), bound to the scroll-to-top button.
- **Line 44**: `logScrollQuestion(activeQuestion, 'DOWN')` → `SCROLL_QUESTION_DOWN`
  - From `scrollDown()` (lines 43-51), bound to the scroll-to-bottom button.
  - Both fire unconditionally on click, before the smooth-scroll animation runs.
- **Line 54**: `logAnswerEntered(question)` → `ANS_ENTERED`
  - From `answerEntered(question)` (lines 53-68), wired to the `(answerEntered)` output of the
    child `sca-answer-zone` and `nvt-answer-zone` components (single-choice and numeric-value-type
    answer entry respectively).
  - Fires unconditionally as the first line of the handler, *before* the state-downgrade logic
    (lines 56-67) that reverts `ANSWERED`/`ANS_AND_MARKED_FOR_REVIEW` back to
    `NOT_ANSWERED`/`MARKED_FOR_REVIEW` when an already-submitted answer is edited — so `ANS_ENTERED`
    fires on every edit regardless of prior state.

### `submit-panel/submit-panel.component.ts` (`SubmitPanelComponent`)

- **Line 31**: `logJumpPreviousQuestion(activeQuestion)` → `GOTO_PREV_QUESTION`
  - From `showPrevQuestion()` (lines 29-33), bound to the BACK button. Button is
    `[disabled]="!prevQuestionExists()"`, so only reachable when a previous question exists.
- **Line 37**: `logJumpNextQuestion(activeQuestion)` → `GOTO_NEXT_QUESTION`
  - From `showNextQuestion()` (lines 35-39), bound to the NEXT button, gated the same way via
    `nextQuestionExists()`.
  - Both log the event first, then call `activateQuestion(...)`, which separately triggers
    `QUESTION_ACTIVATED`.

### `question-action-panel/question-action-panel.component.ts` (`QuestionActionPanelComponent`)

- **Line 23**: `logAnswerAction(activeQ, "SAVE_&_NEXT")`
  - From `saveAndNext()` (lines 18-26), bound to the Save & Next button.
  - **Gated** by `answerExists()` (lines 54-63): alerts and returns `false` if `activeQuestion.answer == null`, so the event does not fire when nothing has been answered.
- **Line 33**: `logAnswerAction(activeQ, "SAVE_&_MARK_REVIEW")`
  - From `saveAndMarkForReview()` (lines 28-36), bound to the Save & Mark for Review button.
  - Same `answerExists()` gate.
- **Line 43**: `logAnswerAction(activeQ, "CLEAR_RESPONSE")`
  - From `clearResponse()` (lines 38-44), bound to the Clear Response button.
  - Unconditional — fires on every click, after nulling the answer and resetting state to `NOT_ANSWERED`.
- **Line 50**: `logAnswerAction(activeQ, "MARK_REVIEW_&_NEXT")`
  - From `markForReviewAndNext()` (lines 46-52), bound to the Mark for Review & Next button.
  - Unconditional — a question can be marked for review without an answer.
  - All four events, when logged, occur after `apiSvc.saveAnswerAction(...)` but before
    `activateNextQuestion()` (which triggers `QUESTION_ACTIVATED` if a next question exists).

## Coverage gap: `GOTO_PALETTE_QUESTION` is dead code in both apps

`EventLogService.logJumpToPaletteQuestion()` (→ `GOTO_PALETTE_QUESTION`) is never called anywhere
in the jee-main tree. `question-palette/question-palette.component.ts` does not inject
`EventLogService` at all — `displayQuestion(q)` (lines 18-20) calls `examSvc.activateQuestion(q)`
directly. So clicking a question number in the jee-main palette only produces `QUESTION_ACTIVATED`
(via the shared `activateQuestion()` path), never `GOTO_PALETTE_QUESTION`.

**Update (verified against jee-advanced, see parity section below): jee-advanced's palette behaves
identically.** Its `question-palette.component.ts:20` does inject `EventLogService`, but the click
handler in its template (`question-palette.component.html:7`,
`(click)="examSvc.activateQuestion(question)"`) calls `activateQuestion()` directly and never
invokes `logJumpToPaletteQuestion()`. So `GOTO_PALETTE_QUESTION` is defined in `EVENT_TYPE_MAP` and
wired into `EventLogService`, but is not emitted by either exam type today — not a jee-main-vs-
jee-advanced asymmetry, but a genuinely unused event across the whole app.

## Summary: all 12 `EventLogService` methods

| Method | Event(s) | jee-main coverage | Primary call site |
|---|---|---|---|
| `logExamStartEvent` | `EXAM_START` | Shared | `jee-base.service.ts:121` |
| `logQuestionActivation` | `QUESTION_ACTIVATED` | Shared | `jee-base.service.ts:81` |
| `logJumpSection` | `GOTO_SECTION_START` | jee-main only | `section-header.component.ts:18` |
| `logJumpNextQuestion` | `GOTO_NEXT_QUESTION` | jee-main only | `submit-panel.component.ts:37` |
| `logJumpPreviousQuestion` | `GOTO_PREV_QUESTION` | jee-main only | `submit-panel.component.ts:31` |
| `logJumpToPaletteQuestion` | `GOTO_PALETTE_QUESTION` | **Not called in jee-main** | **Not called anywhere — dead in jee-advanced too, see parity section** |
| `logAnswerEntered` | `ANS_ENTERED` | jee-main only | `question-display.component.ts:54` |
| `logScrollQuestion` | `SCROLL_QUESTION_UP` / `SCROLL_QUESTION_DOWN` | jee-main only | `question-display.component.ts:36,44` |
| `logPaletteToggle` | `PALETTE_COLLAPSED` / `PALETTE_EXPANDED` | jee-main only | `exam-screen.component.ts:43` |
| `logAnswerAction` | `SAVE_&_NEXT`, `SAVE_&_MARK_REVIEW`, `CLEAR_RESPONSE`, `MARK_REVIEW_&_NEXT` | jee-main only | `question-action-panel.component.ts:23,33,43,50` |
| `logLapChange` | `LAP_CHANGE` | Shared | `jee-base.service.ts:176` |
| `logExamSubmitEvent` | `EXAM_SUBMIT` | Shared | `jee-base.service.ts:192` |

## jee-advanced parity check

Cross-checked every component under
`projects/app-jee-exam/src/features/jee-advanced/pages/04-exam-screen/` against the jee-main emit
points above. jee-advanced shares the same `EventLogService` class (route-scoped separately, see
"How telemetry works") and the same `JeeBaseService` call sites, so `EXAM_START`,
`QUESTION_ACTIVATED`, `LAP_CHANGE`, and `EXAM_SUBMIT` are structurally identical between the two
apps. The component-level (non-shared) call sites are not at parity, though:

### Confirmed gaps (jee-main logs it, jee-advanced doesn't)

- **`GOTO_SECTION_START` missing.** jee-advanced's `section-header.component.ts:18` injects
  `EventLogService` — same as jee-main's — but never calls any of its methods. `selectSection()`
  (line 33) goes straight to `examSvc.activateSection(section)` → `activateQuestion()`, which only
  yields `QUESTION_ACTIVATED`. jee-main's equivalent explicitly calls `logJumpSection()` first. This
  is the clearest regression: same component name, same injected service, missing the one line
  that logs the event.
- **`GOTO_PREV_QUESTION` missing.** jee-advanced's "previous question" action lives in
  `question-action-panel.component.ts:44-49` (`previous()`), which calls
  `examSvc.activateQuestion(prevQ)` directly with no `logJumpPreviousQuestion()` call — even though
  the same file logs `SAVE_&_NEXT`, `MARK_REVIEW_&_NEXT`, and `CLEAR_RESPONSE` a few lines above it.
- **`GOTO_NEXT_QUESTION` has no reachable trigger.** jee-main's free "Next" button (navigate without
  saving) lives in `submit-panel.component.ts`. jee-advanced's `submit-panel.component.html` is a
  stub — a single `disabled` Submit button, no other markup — and its component class
  (`submit-panel.component.ts`) declares no methods at all. There is currently no "next without
  saving" action anywhere in jee-advanced's UI, so this event type is unreachable, not just unlogged.

### Structural gap: submit/lap flow isn't wired up yet

The Submit button in jee-advanced's `submit-panel.component.html` is hardcoded `disabled` with no
click handler, so `JeeBaseService.submitExamAttempt()` — and therefore `EXAM_SUBMIT` plus the
submit-triggered `LAP_CHANGE` — can currently only fire via the countdown-timer auto-submit path
(`countdown()` in `jee-base.service.ts`), never by manual user action. There is also no "Start Next
Lap" button anywhere in jee-advanced, so `LAP_CHANGE` has no manual trigger either. Given
`app-jee-advanced`'s exam-screen is explicitly still being rebuilt (per this repo's top-level
`CLAUDE.md`), this reads as work-in-progress rather than a logging bug — but it means lap/submit
telemetry is presently dead in practice for jee-advanced.

### By design, not a gap

`SAVE_&_MARK_REVIEW` has no jee-advanced equivalent. jee-main has four distinct action buttons
(Save & Next, Save & Mark for Review, Clear, Mark for Review & Next). jee-advanced's action panel
has only three (`saveAndNext`, `markForReviewAndNext`, `clearResponse`) —
`markForReviewAndNext()` (`question-action-panel.component.ts:27-34`) internally decides between
`ANS_AND_MARKED_FOR_REVIEW` and `MARKED_FOR_REVIEW` via `isAnswerStaged()`, but always logs
`MARK_REVIEW_&_NEXT`. This mirrors the real NTA advanced UI (fewer buttons than JEE Main), so
`SAVE_&_MARK_REVIEW` is structurally never emitted in jee-advanced — not a bug, but worth knowing
if building cross-exam-type analytics that expect event parity.

### Unused injections (noise, not emit points)

Six jee-advanced components inject `EventLogService` (and `ExamApiService`) but call neither:
`exam-toolbar.component.ts`, `page-header.component.ts`, `paper-breadcrumb-bar.component.ts`,
`question-status-legend.component.ts`, `candidate-info-panel.component.ts`, and
`submit-panel.component.ts`. Likely copy-paste scaffolding ahead of features not yet built — no
telemetry impact today, but worth knowing so they aren't mistaken for working emit points.

### jee-advanced summary

| Event | jee-advanced status |
|---|---|
| `EXAM_START` | OK — shared `JeeBaseService` path |
| `QUESTION_ACTIVATED` | OK — shared `JeeBaseService` path |
| `GOTO_SECTION_START` | **Gap** — `EventLogService` injected but unused in `section-header.component.ts` |
| `GOTO_PREV_QUESTION` | **Gap** — `previous()` skips the log call |
| `GOTO_NEXT_QUESTION` | **Unreachable** — no free "next" action exists in the current UI |
| `GOTO_PALETTE_QUESTION` | Dead in both apps (see coverage-gap section above) |
| `ANS_ENTERED` | OK — `question-display.component.ts:72` |
| `SCROLL_QUESTION_UP`/`DOWN` | OK — `question-display.component.ts:54,62` |
| `PALETTE_COLLAPSED`/`EXPANDED` | OK — `exam-screen.component.ts:37` |
| `SAVE_&_NEXT` | OK — `question-action-panel.component.ts:23` |
| `MARK_REVIEW_&_NEXT` | OK — `question-action-panel.component.ts:32` |
| `CLEAR_RESPONSE` | OK — `question-action-panel.component.ts:41` |
| `SAVE_&_MARK_REVIEW` | By design — no dedicated UI action in jee-advanced |
| `LAP_CHANGE` | Structurally present but currently only reachable via timer auto-submit (no "Start Next Lap" button) |
| `EXAM_SUBMIT` | Structurally present but currently only reachable via timer auto-submit (Submit button is a disabled stub) |
