export type TaggableItemType = 'PROBLEM' | 'QUESTION' ;

export type TagSO = {
  id: number,
  tagText: string,
  normalizedTagText: string,
  color: string,
  topicId: number,
  topicName: string,
  createdAt: string,
  associationCount: number, // -1 unless returned by TagApiService.getTagsForTopic()
}

// Unifies single-item and bulk-item hosts for TagAssociationDialogComponent.
// One target = single-item mode; multiple = bulk mode. No topicId here —
// topic context is a dialog-level default (see the dialog's defaultTopicId
// input), not a per-item property.
export type TagAssociationTarget = {
  itemType: TaggableItemType,
  itemId: number,
  displayLabel: string,
}

// Only used by TagAssociationApiService.getItemsForTag(), which the
// tag-association-dialog widget itself does not call.
export type ProblemVO = {
  id: number,
  exerciseNum: number,
  exerciseName: string,
  problemType: string,
  problemKey: string,
  difficultyLevel: number,
}

export type QuestionSummaryVO = {
  id: number,
  questionId: string,
  topicName: string,
  problemType: string,
  questionNumber: number,
}

export type TagAssociationRes = {
  problems: ProblemVO[],
  questions: QuestionSummaryVO[],
}

// Client-side replica of the backend's TagHelper.normalize(): trim, lowercase,
// strip whitespace/-/./: (not apostrophes). Must stay in sync with the server.
export function normalizeTagText( tagText: string ): string {
  return tagText.trim().toLowerCase().replace( /[\s\-.:]+/g, '' ) ;
}
