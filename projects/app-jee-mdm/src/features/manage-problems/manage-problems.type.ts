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

export type ChapterProblemTopicMapping = {
  chapterNum: number,
  chapterName: string,
  book: BookSummary,
  exercises: {
    exerciseNum: number,
    exerciseName: string,
    problems: {
      problemId: number,
      problemType: string,
      problemKey: string,
      mappingId: number,
      topic: Topic
    }[]
  }[]
}