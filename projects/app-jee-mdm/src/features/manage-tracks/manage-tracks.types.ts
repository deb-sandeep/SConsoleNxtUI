export type TopicProblemCounts = {
  topicId: number,
  numProblems: number,
  problemTypeCount: Record<string, number>
}