import { ExamQuestionConfig, ExamQuestionSubmitStatus } from "@jee-common/util/exam-data-types";

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

    private activationTime: Date | null = null ;

    constructor( public index: number,
                 public questionConfig: ExamQuestionConfig ) {}

    // This method is called right after the question has been
    // made as the active question in JEEMainService
    activate() {
        if( this.state === "NOT_VISITED" ) {
            this.state = "NOT_ANSWERED" ;
        }
        this.activationTime = new Date() ;
    }

    updateTimeSpent() {
        if( this.activationTime != null ) {
            const currentTime = new Date() ;
            const activationDuration = ( currentTime.getTime() - this.activationTime!.getTime() )/1000 ;
            this.totalTimeSpent += activationDuration ;
            this.activationTime = currentTime ;
        }
    }

    deactivate() {
        this.updateTimeSpent() ;
        this.activationTime = null ;
    }
}