import { TopicSO } from "@jee-common/util/master-data-types";

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

export interface ExamQuestionConfig {
    id: number;
    sequence: number;
    questionId: number;
    sectionId: number;
    question: QuestionSO;
}

export interface ExamSectionConfig {
    id: number;
    examId: number;
    examSequence: number;
    syllabusName: string;
    problemType: string;
    title: string;
    correctMarks: number;
    wrongPenalty: number;
    numQuestions: number;
    numCompulsoryQuestions: number;
    instructions: string[];
    questions: ExamQuestionConfig[];
}

export interface ExamConfig {
    id: number;
    type: string;
    note: string;
    numPhyQuestions: number;
    numChemQuestions: number;
    numMathQuestions: number;
    totalMarks: number;
    duration: number;
    creationTime: Date;
    sections: ExamSectionConfig[];
    topics: Record<string, TopicSO[]> ;
}

