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

