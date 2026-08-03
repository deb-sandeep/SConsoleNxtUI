# JEE Advanced CBT — Button State Model

**Enum reference:**

```typescript
export type ExamQuestionSubmitStatus =
    "NOT_VISITED" |
    "NOT_ANSWERED" |
    "ANSWERED" |
    "MARKED_FOR_REVIEW" |
    "ANS_AND_MARKED_FOR_REVIEW" ;
```

---

## 1. Model summary

JEE Advanced runs a three-button model: `Save & Next`, `Clear Response`, `Mark for Review & Next`. Unlike JEE Main's four-button model, `Mark for Review & Next` is a single button that infers the resulting state from whatever answer is currently staged at click-time. There is no separate "Save & Mark for Review" action in JEE Advanced.

This divergence from JEE Main is confirmed and already reflected in the decision to build distinct button-bar components per exam format rather than a shared model.

---

## 2. Per-button rules

### 2.1 Save & Next

| Precondition | Action |
|---|---|
| Answer staged | Save answer, set state to `ANSWERED` |
| No answer staged | Set state to `NOT_ANSWERED` |

- Advances to the next question in all cases.
- If the current question is the last in its section, advances to the first question of the next section.
- If last question of the last section is displayed, advances to the first question of the first section.
- **Confirmed:** the review flag is stripped regardless of prior review state. `Save & Next` resolves purely on the staged-answer predicate, not on prior state: `MARKED_FOR_REVIEW → NOT_ANSWERED` (no answer staged), `ANS_AND_MARKED_FOR_REVIEW → ANSWERED` (answer staged). There is no path back to a review-flagged state through this button.

### 2.2 Mark for Review & Next

| Precondition | Action |
|---|---|
| Answer staged | Save answer, set state to `ANS_AND_MARKED_FOR_REVIEW` |
| No answer staged | Set state to `MARKED_FOR_REVIEW`, no answer persisted |

- Advances to the next question, same section-rollover behavior as `Save & Next`.
- If last question of the last section is displayed, advances to the first question of the first section.
- Confirmed from official NTA candidate-demo instruction text: the button "saves your answer for the current question, marks it for review, and then goes to the next question" — i.e. save and mark are one action, not two.
- **Confirmed:** if a question was previously `ANSWERED` and the candidate revisits it and clicks `Mark for Review & Next` without re-selecting an option, the handler reads the restored (previously saved) selection as staged, producing `ANS_AND_MARKED_FOR_REVIEW`. Implementation: `activateQuestion()` restores the prior selection into the UI control, and the button always reads current UI selection state, not a "was it touched this visit" flag. This keeps the inference symmetric with `Save & Next`.

### 2.3 Clear Response

| Prior state | Resulting state |
|---|---|
| `ANSWERED` | `NOT_ANSWERED` |
| `ANS_AND_MARKED_FOR_REVIEW` | `NOT_ANSWERED` |
| `MARKED_FOR_REVIEW` | `NOT_ANSWERED` |
| `NOT_ANSWERED` | `NOT_ANSWERED` (no-op) |

- Does not navigate; stays on the current question.
- `NOT_VISITED` is not a reachable prior state for this handler — a question must be activated before any action button is available.
- Both review-flagged transitions (`ANS_AND_MARKED_FOR_REVIEW → NOT_ANSWERED` and `MARKED_FOR_REVIEW → NOT_ANSWERED`) reset the entire submitted response, not just the answer payload: `Clear Response` is scoped to the whole response, clearing both the answer and the review flag in one action.
- **Verification status: confirmed.**

---

## 3. Consolidated transition table

| Button | Answer staged? | Prior state | Resulting state | Confidence |
|---|---|---|---|---|
| Save & Next | Yes | any | `ANSWERED` | Confirmed |
| Save & Next | No | any | `NOT_ANSWERED` | Confirmed |
| Save & Next | No | `MARKED_FOR_REVIEW` | `NOT_ANSWERED` | Confirmed |
| Save & Next | Yes | `ANS_AND_MARKED_FOR_REVIEW` | `ANSWERED` | Confirmed |
| Mark for Review & Next | Yes | any | `ANS_AND_MARKED_FOR_REVIEW` | Confirmed |
| Mark for Review & Next | No | any | `MARKED_FOR_REVIEW` | Confirmed |
| Mark for Review & Next | (revisit, no reselection) | `ANSWERED` | reads restored selection as staged → `ANS_AND_MARKED_FOR_REVIEW` | Confirmed |
| Clear Response | — | `ANSWERED` | `NOT_ANSWERED` | Confirmed |
| Clear Response | — | `ANS_AND_MARKED_FOR_REVIEW` | `NOT_ANSWERED` | Confirmed |
| Clear Response | — | `MARKED_FOR_REVIEW` | `NOT_ANSWERED` | Confirmed |
| Clear Response | — | `NOT_ANSWERED` | `NOT_ANSWERED` (no-op) | Reasoned, not observed |

