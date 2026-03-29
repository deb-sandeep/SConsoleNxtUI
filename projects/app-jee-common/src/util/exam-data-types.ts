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
    rating: number
}

export interface ExamQuestionSO {
    id: number;
    sequence: number;
    questionId: number;
    sectionId: number;
    question: QuestionSO;
}

export interface ExamSectionSO {
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
    questions: ExamQuestionSO[];
}

export interface ExamSO {
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
    sections: ExamSectionSO[];
    topics: Record<string, TopicSO[]> ;
}

export interface ExamQuestionAttemptSO {
    id: number;
    examQuestion: ExamQuestionSO;
    examSectionAttemptId: number;
    timeSpent: number;
    evaluationStatus: string;
    answerProvided: string;
    answerSubmitStatus: string;
    score: number;
    rootCause: string|null;
}

export interface ExamSectionAttemptSO {
    id: number;
    examSection: ExamSectionSO;
    examAttemptId: number;
    score: number;
    avoidableLossPct: number;
    questionAttempts: ExamQuestionAttemptSO[] ;
}

export interface ExamAttemptSO {
    id: number;
    exam: ExamSO;
    attemptDate: Date;
    score: number;
    avoidableLossPct: number;
    unavoidableLossPct: number;
    status: string;
    sectionAttempts: ExamSectionAttemptSO[];
    events: ExamEvent[];
}

export type ExamAnswerAction =
    "SAVE_&_NEXT" |
    "SAVE_&_MARK_REVIEW" |
    "CLEAR_RESPONSE" |
    "MARK_REVIEW_&_NEXT" ;

export type ExamQuestionNav =
    "GOTO_SECTION_START" |
    "GOTO_NEXT_QUESTION" |
    "GOTO_PREV_QUESTION" |
    "GOTO_PALETTE_QUESTION" ;

export type ExamUIInteraction =
    "ANS_ENTERED" |
    "SCROLL_QUESTION_DOWN" |
    "SCROLL_QUESTION_UP" |
    "PALETTE_COLLAPSED" |
    "PALETTE_EXPANDED" ;

export type ExamSartStopEvent =
    "EXAM_START" |
    "EXAM_SUBMIT" ;

export type LapChangeEvent =
    "LAP_CHANGE" ;

export type QuestionActivationEvent =
    "QUESTION_ACTIVATED" ;

export type ExamEventType =
    "ANS_ACTION" |
    "QUESTION_NAV" |
    "UI_INTERACTION" |
    "START_STOP" |
    "LAP" |
    "Q_ACTIVATION" ;

export type ExamEventName =
    QuestionActivationEvent |
    LapChangeEvent |
    ExamSartStopEvent |
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
    eventType: ExamEventType;
    eventName: ExamEventName;
    payload: string;
    creationTime: Date;
    timeMarker: number;
}

export interface CreateExamAttemptResponse {
    examId: number;
    examAttemptId: number;
    questionAttemptIds: Record<number, number>;
}

export type LapName =
    "L1" | "L2P" | "L2" | "AMR" | "L3P" | "L3.1" | "L3.2" ;

export interface WrongAnswerRootCause {
    cause: string;
    group: string;
}