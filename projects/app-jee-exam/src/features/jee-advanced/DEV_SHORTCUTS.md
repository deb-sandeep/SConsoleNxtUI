# JEE Advanced — dev acceleration shortcuts

Temporary, dev-only conveniences introduced while rapidly iterating on the JEE Advanced UI.
None of these are meant to reach production — this file tracks all of them so they can be
found and removed/reverted in one pass once the real backend-driven flow is ready.

## 1. `examConfig.mockApi` flag
- **Where**: `app-jee-exam/src/exam-config.js.ts`
- **What**: when `true`, the `jee-advanced/:examId` route (`routes.ts`) provides
  `MockExamApiService` instead of the real `ExamApiService`.
- **Revert**: set back to `false` (or delete the flag) once real backend integration is done
  for jee-advanced.

## 2. `MockExamApiService`
- **Where**: `app-jee-exam/src/features/jee-advanced/mock-exam-api.service.ts`
- **What**: extends `ExamApiService`; serves `getExamDetails()` from a static JSON fixture,
  synthesizes `createExamAttempt()`'s response locally, and no-ops every state-persisting call
  (`logEvent`, `saveTimeSpent`, `saveAnswerAction`, `saveLapSnapshot`, `updateQuestionRating`,
  `startExamSession`, `extendExamSession`, `endExamSession`, `updateAttemptRootCause`), plus
  `getRootCauses`/`getQAttemptLapAnalysisObservationList` return `[]`.
- **Revert**: delete the file and the conditional provider wiring in `routes.ts` (item 1).

## 3. Static exam-config fixture
- **Where**: `app-jee-exam/public/mock-data/jee-advanced-exam-config.json`
- **What**: one captured `APIResponse<ExamSO>` envelope, served in place of a live
  `GET /Master/Exam/{examId}` call by `MockExamApiService`.
- **Revert**: delete once mock mode (item 1/2) is retired. Consider whether it should be
  gitignored rather than committed, if it contains data that shouldn't ship.

## 4. Exam-listing "dev shortcut" button
- **Where**: `app-jee-exam/src/features/exam-listing/exam-listing.component.ts`
  (`goToJeeAdvancedMockup()`) and `.html` (footer button "Go to JEE Advanced exam-screen (dev
  shortcut)").
- **What**: navigates straight to `/jee-advanced/16/exam-screen`, bypassing `login-dialog` and
  `instruction-screen` entirely (and bypassing the real `startExam()`/exam-listing table
  altogether). Hardcoded `examId=16` to match the captured fixture (item 3) — ignored by
  `MockExamApiService.getExamDetails()` regardless.
- **Revert**: delete the method and button once exam-screen is wired to real data and the
  normal `startExam()` → login → instructions → exam-screen flow is what should be exercised.

## Status
All four are active as of 2026-07-23, while exam-screen widget wiring is in progress.