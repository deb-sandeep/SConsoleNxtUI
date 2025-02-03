import { BookSummary, Topic } from "../manage-books/manage-books.type";

export type TopicChapterMapping = {
  topicId: number,
  topicName: string,
  topicSection: string,
  chapters: {
    mappingId: number,
    attemptSeq: number,
    bookId: number,
    bookShortName: string,
    chapterNum: number,
    chapterName: string,
    problemMappingDone: boolean,
    selected?: boolean
  }[],
}

export type ProblemTopicMapping = {
  problemId: number,
  problemType: string,
  problemKey: string,
  mappingId: number,
  topic: Topic,
  selected?: boolean
}

export type ExerciseProblems = {
  exerciseNum: number,
  exerciseName: string,
  problems: ProblemTopicMapping[]
}

export type ChapterProblemTopicMapping = {
  chapterNum: number,
  chapterName: string,
  book: BookSummary,
  exercises: ExerciseProblems[]
}

export type SelectedTopic = {
  topicId: number,
  topicName: string,
  topicSection: string,
  syllabusName:string
}