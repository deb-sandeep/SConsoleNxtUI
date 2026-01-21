export type QTypeStatusSO = {
    type : string,
    numUnassigned : number,
    numAssigned : number,
    numAttempted : number,
    numQuestions : number,
}

export type TopicStatusSO = {
    topicId : number,
    topicName : string,
    numQuestions : number,
    questionTypeStats : Record<string, QTypeStatusSO|undefined>
}

export type SyllabusStatusSO = {
    syllabusName : string,
    topicStats : TopicStatusSO[],
    numQuestions : number,
}

export type QuestionRepoStatusSO = {
    numQuestions : number,
    syllabusStatusMap : Record<string, SyllabusStatusSO>,
}