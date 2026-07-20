// Mirrors the Java ActiveTopicChartVO
// (src/main/java/com/sandy/sconsole/endpoints/rest/live/problem/vo/ActiveTopicChartVO.java),
// served by GET /Topic/{topicId}/burnChart.

export type BurnPointVO = {
  date: string,
  remaining: number,
}

export type DayCountPointVO = {
  date: string,
  numSolved: number,
}

export type BurnChartTopicVO = {
  topicId: number,
  syllabusName: string,
  sectionName: string,
  topicName: string,
}

export type BurnChartPlanVO = {
  startDate: string,
  coachingEndDate: string | null,
  selfStudyEndDate: string | null,
  exerciseStartDate: string,
  exerciseEndDate: string,
  endDate: string,
  numTotalProblems: number,
  numExerciseDays: number,
  originalBurnRate: number,
}

export type BurnChartStatusVO = {
  currentZone: string,
  numProblemsLeft: number,
  currentBurnRate: number,
  requiredBurnRate: number,
  burnStressScore: number,
  scoreLabel: string,
  numOvershootDays: number,
  leadLagProblems: number,
  numExerciseDaysLeft: number,
}

export type ProblemStateBreakdown = {
  totalCount: number,
  numAssigned: number,
  numCorrect: number,
  numIncorrect: number,
  numLater: number,
  numPigeons: number,
  numPigeonsExplained: number,
  numPigeonsSolved: number,
  numPurged: number,
  numReassign: number,
  numRedo: number,
}

export type BurnChartVO = {
  topic: BurnChartTopicVO,
  plan: BurnChartPlanVO,
  status: BurnChartStatusVO,
  actualBurn: BurnPointVO[],
  idealBurn: BurnPointVO[],
  projectedBurn: BurnPointVO[],
  burnStressZoneColor: string,
  numPigeonedProblems: number,
  numProblemsSolvedToday: number,
  burnMetOverride: boolean,
  allTimeProblemState: ProblemStateBreakdown,
  todayProblemState: ProblemStateBreakdown,
  l30Burn: DayCountPointVO[],
}
