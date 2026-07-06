export type NewProblemAttemptResponse = {
  problemAttemptId: number,
  totalDuration: number,
}

export type BurnPointVO = {
  date: string,
  remaining: number,
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

export type BurnChartVO = {
  topic: BurnChartTopicVO,
  plan: BurnChartPlanVO,
  status: BurnChartStatusVO,
  actualBurn: BurnPointVO[],
  idealBurn: BurnPointVO[],
  projectedBurn: BurnPointVO[],
}