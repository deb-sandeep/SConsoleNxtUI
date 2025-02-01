export type TopicChapterMapping = {
  topicId:number,
  topicName:string,
  topicSection:string,
  chapters: {
    mappingId:number,
    attemptSeq:number,
    bookId:number,
    bookShortName:string,
    chapterNum:number,
    chapterName:string,
  }[],
}