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

