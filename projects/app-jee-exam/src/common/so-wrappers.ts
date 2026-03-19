import { ExamQuestionConfig } from "@jee-common/util/exam-data-types";

export class ExamSection {

    public firstQuestion: ExamQuestion ;

    constructor( public sectionName: string,
                 public subjectName: string ) {}
}

export type QuestionState =
    "NOT_VISITED" | 
    "NOT_ANSWERED" | 
    "ANSWERED" |
    "MARKED_FOR_REVIEW" | 
    "ANS_AND_MARKED_FOR_REVIEW" ;

export class ExamQuestion {

    nextQuestion: ExamQuestion|null = null ;
    prevQuestion: ExamQuestion|null = null ;

    state: QuestionState = "NOT_VISITED" ;
    answer: string | null = null ;

    constructor( public index: number,
                 public questionConfig: ExamQuestionConfig ) {}

    // This method is called right after the question has been
    // made as the active question in JEEMainService
    activate() {
        if( this.state === "NOT_VISITED" ) {
            this.state = "NOT_ANSWERED" ;
        }
    }
}