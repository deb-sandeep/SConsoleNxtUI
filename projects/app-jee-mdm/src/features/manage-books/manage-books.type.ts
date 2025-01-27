export type BookValidationResult = {
    subject : string,
    series : string,
    name : string,
    author : string,
    shortName : string,
    chapters : ChapterValidationResult[],
    serverFileName : string,
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ChapterValidationResult = {
    title : string,
    exercises : ExerciseValidationResult[],
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ExerciseValidationResult = {
    name : string,
    problems: string[],
    validationMessages : ValidationMessages,
    totalMsgCount : MsgCount
}

export type ValidationMessages = {
    messages : Record<string, ValidationMsg[]>,
    msgCount : MsgCount
}

export type ValidationMsg = {
    type : 'INFO' | 'WARNING' | 'ERROR',
    msg : string
}

export type MsgCount = {
    numError : number,
    numWarning : number,
    numInfo : number,
    total : number
}

export type SaveBookMetaRes = {
    numChaptersCreated : number,
    numExercisesCreated : number,
    numProblemsCreated : number
}

export type BookSummary = {
    id : number,
    subjectName : string,
    syllabusName : string,
    seriesName : string,
    bookName : string,
    author : string,
    bookShortName : string,
    topicMappingDone : boolean,
    numChapters? : number,
    numProblems? : number,
    selected? : boolean
}

export type BookProblemSummary = {
    book: BookSummary,
    chapterProblemSummaries: ChapterProblemSummary[]
}

export type ChapterProblemSummary = {
    chapterNum : number,
    chapterName : string,
    exerciseProblemSummaries : ExerciseProblemSummary[],
    parent: BookProblemSummary
}

export type ExerciseProblemSummary = {
    exerciseNum : number,
    exerciseName : string,
    problemTypeCount : Record<string, number>,
    parent: ChapterProblemSummary
}

export type TopicMapping = {
    mappingId : number,
    topicId : number
}

export type ChapterTopicMapping = {
    chapterNum : number,
    chapterName : string,
    topics : TopicMapping[],

    selected :boolean, // Transactional field
}

export type BookTopicMapping = {
    book : BookSummary,
    chapterTopicMappings : ChapterTopicMapping[]
}

export type Topic = {
    topicId : number,
    syllabusName : string,
    sectionName : string,
    topicName : string,

    isMappedToSelectedChapter:boolean, // Transactional field
}

export type BookTopicMappingRes = {
    syllabusName : string,
    topicMap : Record<number, Topic>,
    bookTopicMappingList : BookTopicMapping[]
}

