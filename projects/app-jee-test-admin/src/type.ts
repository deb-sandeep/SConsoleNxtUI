export type QuestionImageSO = {
    sequence: number,
    pageNumber: number,
    fileName: string,
    lctCtxImage: boolean,
    partNumber: number,
    imgWidth: number,
    imgHeight: number,
    imgData: string,
}

export type QuestionSO = {
    id: number,
    questionId: number,
    syllabusName: string,
    topicName: string,
    topicId: number,
    sourceId: string,
    problemType: string,
    lctSequence: number,
    questionNumber: number,
    answer: string,
    serverSyncTime: Date,
    questionImages: QuestionImageSO[],
}

