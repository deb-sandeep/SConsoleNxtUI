export const PROBLEM_TYPES = [ 'SCA', 'MCA', 'LCT', 'ART', 'CMT', 'MMT', 'NVT', 'SUB' ] ;

export type TopicSO = {
  id: number,
  sectionName: string,
  topicName: string,
}

export type SyllabusSO = {
  syllabusName: string,
  subjectName: string,
  color: string,
  iconName: string,
  topics:TopicSO[]
}

export type TopicTrackAssignmentSO = {
  id?:number,
  trackId:number,
  sequence:number,
  topicId:number,
  startDate:Date,
  coachingNumDays:number,
  selfStudyNumDays:number,
  consolidationNumDays:number,
  endDate:Date,
  interTopicGapNumDays:number
}

export type TrackSO = {
  id: number,
  trackName: string,
  color: string,
  syllabusName: string,
  assignedTopics: TopicTrackAssignmentSO[],
  startDate:Date,
}

export type SessionTypeSO = {
  id: number,
  sessionType : string;
  description : string;
  color : string;
  iconName : string;
}

export type SessionPauseSO = {
  id: number,
  sessionId:number,
  startTime:Date,
  endTime:Date
}

export type TopicProblemSO = {
  topicId: number,
  syllabusName: string,
  topicSection: string,
  topicName: string,
  bookId: number,
  bookShortName: string,
  bookSeries: string,
  chapterNum: number,
  chapterName: string,
  problemId: number,
  exerciseNum: number,
  exerciseName: string,
  problemType: string,
  problemKey: string,
  difficultyLevel: number,
  problemState: string,
  lastAttemptTime: Date,
  totalDuration: number,
  numAttempts: number,

  selected?:boolean, // Local attribute
}

export type ProblemAttemptSO = {
  id: number,
  sessionId: number,
  topicId: number,
  problemId: number,
  startTime: Date,
  endTime: Date,
  effectiveDuration: number,
  prevState: string,
  targetState: string,
}