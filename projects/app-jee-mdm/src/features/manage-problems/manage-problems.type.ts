import { BookSummary, Topic } from "../manage-books/manage-books.type";

export const PROBLEM_TYPES = [ 'SCA', 'MCA', 'LCT', 'ART', 'CMT', 'MMT', 'NVT', 'SUB' ] ;

export type TopicChapterMapping = {
  topicId: number,
  topicName: string,
  topicSection: string,
  problemTypeCountMap: Record<string, number>,
  problemCount:number,
  chapters: {
    mappingId: number,
    attemptSeq: number,
    bookId: number,
    bookShortName: string,
    chapterNum: number,
    chapterName: string,
    problemMappingDone: boolean,
    problemTypeCountMap: Record<string, number>,
    problemCount:number,
    selected?: boolean,
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
  problems: ProblemTopicMapping[],
  selected?:boolean
}

export type ChapterProblemTopicMapping = {
  chapterNum: number,
  chapterName: string,
  book: BookSummary,
  selTopic: Topic,
  exercises: ExerciseProblems[]
}
