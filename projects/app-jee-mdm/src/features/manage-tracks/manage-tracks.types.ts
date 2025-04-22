export type TopicProblemCounts = {
  topicId: number,
  numProblems: number,
  problemTypeCount: Record<string, number>,
  numRemainingProblems: number,
  remainingProblemTypeCount: Record<string, number>
}