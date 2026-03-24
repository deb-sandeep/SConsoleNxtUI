import { ExamQuestionSO, ExamQuestionSubmitStatus } from "@jee-common/util/exam-data-types";

export class ExamSection {

    public firstQuestion: ExamQuestion ;

    constructor( public sectionName: string,
                 public subjectName: string ) {}
}

export class ExamQuestion {

    nextQuestion: ExamQuestion|null = null ;
    prevQuestion: ExamQuestion|null = null ;

    examQuestionAttemptId: number = 0 ;
    state: ExamQuestionSubmitStatus = "NOT_VISITED" ;
    answer: string | null = null ;
    totalTimeSpent: number = 0 ;
    timeSpentInCurrentLap: number = 0 ;

    constructor( public index: number,
                 public questionConfig: ExamQuestionSO ) {}

    // This method is called right after the question has been
    // made as the active question in JEEMainService
    activate() {
        if( this.state === "NOT_VISITED" ) {
            this.state = "NOT_ANSWERED" ;
        }
    }

    deactivate() {
    }
}