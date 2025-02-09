export type Topic = {
  id: number,
  sectionName: string,
  topicName: string,
}

export type Syllabus = {
  syllabusName: string,
  subject: { subjectName:string },
  topics:Topic[]
}

