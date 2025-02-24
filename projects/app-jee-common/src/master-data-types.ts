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
  bufferLeft:number,
  bufferRight:number,
  theoryMargin:number,
  startDate:Date,
  endDate:Date,
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