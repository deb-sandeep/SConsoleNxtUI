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
    questionId: string,
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
    state: string;
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

export type ExamAnswerAction =
    "SAVE_&_NEXT" |
    "SAVE_&_MARK_REVIEW" |
    "CLEAR_RESPONSE" |
    "MARK_REVIEW_&_NEXT" ;

export type ExamQuestionNav =
    "SECTION_JUMPED" |
    "NEXT_QUESTION" |
    "PREV_QUESTION" ;

export type ExamUIInteraction =
    "ANS_ENTERED" |
    "SCROLL_QUESTION_DOWN" |
    "SCROLL_QUESTION_UP" |
    "PALETTE_COLLAPSED" |
    "PALETTE_EXPANDED" ;

export type ExamEventID =
    "EXAM_START" |
    "QUESTION_ACTIVATED" |
    "EXAM_SUBMIT" |
    ExamUIInteraction |
    ExamQuestionNav |
    ExamAnswerAction ;

export type ExamQuestionSubmitStatus =
  "NOT_VISITED" |
  "NOT_ANSWERED" |
  "ANSWERED" |
  "MARKED_FOR_REVIEW" |
  "ANS_AND_MARKED_FOR_REVIEW" ;

export interface ExamEvent {
    id: number;
    examAttemptId: number;
    sequence: number;
    eventId: ExamEventID;
    payload: string;
    creationTime: Date;
    timeMarker: number;
}

export interface CreateExamAttemptResponse {
    examId: number;
    examAttemptId: number;
    questionAttemptIds: Record<number, number>;
}