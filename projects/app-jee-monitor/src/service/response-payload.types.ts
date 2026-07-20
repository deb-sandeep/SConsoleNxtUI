import { ProblemStateBreakdown } from "@jee-common/util/burn-chart-types" ;
export type { BurnPointVO, DayCountPointVO, BurnChartTopicVO, BurnChartPlanVO, BurnChartStatusVO, ProblemStateBreakdown, BurnChartVO } from "@jee-common/util/burn-chart-types" ;

export type SessionEvent = {
  eventType: string,
  time: Date,
  payload: any,
}

export type SessionStart = {
  sessionId: number,
  startTime: Date,
  sessionType: string,
  syllabusName: string,
  topicName: string,
}

export type SessionEnd = {

  sessionId: number,
  startTime: Date,
  endTime: Date,
  effectiveDuration: number,
  sessionType: string,
  syllabusName: string,
  topicName: string,
}

export type ProblemAttemptStart = {

  sessionId: number,
  problemAttemptId: number,
  startTime: Date,
  syllabusName: string,
  topicName: string,
  bookName: string,
  chapterNum: number,
  chapterName: string,
  problemKey: string,
  currentState: string,
}

export type ProblemAttemptEnd = {

  sessionId: number,
  problemAttemptId: number,
  startTime: Date,
  endTime: Date,
  syllabusName: string,
  topicName: string,
  bookName: string,
  chapterNum: number,
  chapterName: string,
  problemKey: string,
  targetState: string,
  effectiveDuration: number,
}

export type PauseStart = {

  sessionId: number,
  pauseId: number,
  startTime: Date,
}

export type PauseEnd = {

  sessionId: number,
  pauseId: number,
  startTime: Date,
  endTime: Date,
  duration: number,
}

export type SessionExtended = {
  sessionId: number,
  sessionEffectiveDuration: number,
  problemAttemptId: number,
  problemAttemptEffectiveDuration: number,
  pauseId: number,
  pauseDuration: number,
}

export type DashboardState = {
  totalDuration:number,
  syllabusStates: {
    syllabusName: string,
    duration: number,
    topicStates: {
      topicId: number,
      topicName: string,
      currentBurnRate: number,
      requiredBurnRate: number,
      numProblemsSolvedToday: number,
      numPigeons: number,
      burnStressScore: number,
      burnStressZone: string,
      burnStressZoneColor: string,
      burnMetOverride: boolean,
    }[]
  }[]
}

// Live, frequently-refreshed subset pushed over the app-monitor websocket whenever
// ActiveTopicStatistics.refreshState() runs for this topic. Mirrors the Java
// TopicDetailState payload (endpoints/websockets/monitor/payload/TopicDetailState.java).
export type TopicDetailState = {
  topicId: number,
  numProblemsLeft: number,
  currentBurnRate: number,
  requiredBurnRate: number,
  numOvershootDays: number,
  burnStressScore: number,
  burnStressZone: string,
  burnStressZoneColor: string,
  numProblemsSolvedToday: number,
  burnMetOverride: boolean,
  allTimeProblemState: ProblemStateBreakdown,
  todayProblemState: ProblemStateBreakdown,
}
