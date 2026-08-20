import { TopicProblemSO } from "./master-data-types";
import { QuestionSO } from "./exam-data-types";

// A single tag condition — matches an item iff it does (or, when `negate` is
// true, does not) carry `tagId`.
export type TagQueryConditionNode = {
  id: string,
  type: 'condition',
  tagId: number,
  negate: boolean,
}

// A group combines its children with AND/OR, then optionally negates the
// combined result (`negated` — a whole-group NOT, distinct from a leaf
// condition's own `negate`). `collapsed` is UI-only local state; it is
// stripped by TagQueryApiService.search() before the tree is sent to the
// server.
export type TagQueryGroupNode = {
  id: string,
  type: 'group',
  op: 'AND' | 'OR',
  negated: boolean,
  collapsed: boolean,
  children: TagQueryNode[],
}

export type TagQueryNode = TagQueryConditionNode | TagQueryGroupNode;

// The wire form of TagQueryGroupNode — 'collapsed' is UI-only and never sent
// to the server. See TagQueryApiService.search()'s serialize step.
export type TagQueryGroupNodeWire = Omit<TagQueryGroupNode, 'collapsed' | 'children'> & {
  children: TagQueryNodeWire[],
}
export type TagQueryNodeWire = TagQueryConditionNode | TagQueryGroupNodeWire;

export type TagBrowserFilters = {
  syllabusNames: string[],  // SyllabusSO has no numeric id — keyed by name; [] = no constraint
  topicIds: number[],       // TopicSO.id; [] = no constraint
  difficultyMin: number,    // 0 = any; 1-10 scale (TopicProblemSO.difficultyLevel / QuestionSO.rating)

  // Problem-only — TopicProblemSO already carries totalDuration/numAttempts
  // directly (same fields problem-history's own list shows), so these need
  // no new aggregate endpoint, just server-side filtering on the existing
  // search result rows. QuestionSO has neither field (no "attempt" concept
  // exists for Questions in this domain — see question-detail's design
  // notes), so these two filters constrain the Problems branch of results
  // only; Questions are unaffected by them either way.
  //
  // Whenever timeSpentMin/timeSpentMax deviate from the full 0-30 range, or
  // attempts !== 'any', the server should first narrow its Problem
  // candidate set to only *attempted* problems (numAttempts > 0) before
  // applying the specific constraint below — a not-yet-attempted problem
  // has no meaningful time-spent/attempts value to filter on.
  timeSpentMin: number,     // minutes, 0-30; 0 and timeSpentMax===30 together = no constraint
  timeSpentMax: number,     // minutes, 0-30
  attempts: 'any' | '1' | '2+' | '3+' | '4+' | '5+',
}

export type TagQuerySearchReq = {
  tagQuery: TagQueryGroupNodeWire,   // root MUST be a group with >=1 child
  filters: TagBrowserFilters,
}

// No paging — the whole matching set comes back in one shot. Results render
// as a Syllabus > Topic > (...) tree (see entities/results-tree.ts), and
// paging would split a topic's items across pages arbitrarily, breaking
// that grouping. Tag-scoped searches are assumed to stay small enough for
// this to be practical; revisit if that stops holding.
export type TagQuerySearchRes = {
  problems: TopicProblemSO[],
  questions: QuestionSO[],
}

// A saved query is the entire TagQuerySearchReq (tree + filters), stored
// server-side as opaque JSON — recalling it reproduces the exact search
// that was saved. No update/versioning endpoint exists; saving always
// creates a new row.
export type SavedTagQueryVO = {
  id: number,
  name: string,
}

export type SaveQueryReq = {
  name: string,
  query: TagQuerySearchReq,
}
