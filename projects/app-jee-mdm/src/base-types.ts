export type Topic = {
  id: number,
  sectionName: string,
  topicName: string,
}

export type Syllabus = {
  syllabusName: string,
  subjectName: string,
  color: string,
  topics:Topic[]
}

export type TopicTrackAssignment = {
  id:number,
  trackId:number,
  sequence:number,
  topicId:number,
  bufferLeft:number,
  bufferRight:number,
  theoryMargin:number,
  startDate:Date,
  endDate:Date,
}

export type Track = {
  id: number,
  trackName: string,
  color: string,
  syllabusName: string,
  assignedTopics: TopicTrackAssignment[],
}