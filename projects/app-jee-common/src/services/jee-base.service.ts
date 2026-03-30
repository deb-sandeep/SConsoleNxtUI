import {
    ExamAttemptSO,
    ExamQuestionAttemptSO,
    ExamQuestionSubmitStatus,
    ExamSectionAttemptSO,
    ExamSO,
    LapName,
    WrongAnswerRootCause
} from "@jee-common/util/exam-data-types";
import { ExamQuestion, ExamSection } from "../../../app-jee-exam/src/common/so-wrappers";
import { inject, Injectable, signal } from "@angular/core";
import { ExamApiService } from "./exam-api.service";
import { EventLogService } from "./event-log.service";
import { Router } from "@angular/router";

@Injectable()
export class JeeBaseService {

    readonly LAP_TRANSITIONS: Record<LapName, LapName|null> = {
        "L1"   : "L2P",
        "L2P"  : "L2",
        "L2"   : "AMR",
        "AMR"  : "L3P",
        "L3P"  : "L3.1",
        "L3.1" : "L3.2",
        "L3.2" : null,
    } ;

    readonly LAP_CLASSES: Record<LapName, string> = {
        "L1"   : "q-not-visited",
        "L2P"  : "q-marked-for-review",
        "L2"   : "q-marked-for-review",
        "AMR"  : "q-ans-marked-for-review",
        "L3P"  : "q-not-answered",
        "L3.1" : "q-marked-for-review",
        "L3.2" : "q-not-answered",
    }

    protected apiSvc = inject( ExamApiService ) ;
    protected eventLogService = inject( EventLogService ) ;
    protected router = inject( Router );

    examConfig: ExamSO ;
    rootCauses: WrongAnswerRootCause[] ;

    sections: ExamSection[] = [] ;
    questions: ExamQuestion[] = [] ;

    examAttemptId: number = 0 ;

    timeLeftInSeconds = signal<number>( 0 ) ;

    activeQuestion: ExamQuestion ;
    currentLap: LapName = "L1" ;
    examSubmitted = false ;
    eval: ExamAttemptSO | null = null ;

    public async loadRootCauses() {
        this.rootCauses = await this.apiSvc.getRootCauses();
    }

    public activateQuestion( examQuestion: ExamQuestion ) {
        if( this.activeQuestion != null ) {
            this.activeQuestion.deactivate() ;
        }
        this.activeQuestion = examQuestion ;
        this.activeQuestion.activate() ;
        this.eventLogService.logQuestionActivation( this.activeQuestion ) ;
    }

    public getNumQuestions( state: ExamQuestionSubmitStatus ) {
        let numQuestions = 0 ;
        for( let question of this.questions ) {
            if( question.state === state ) {
                numQuestions++ ;
            }
        }
        return numQuestions ;
    }

    public async createExamAttempt() {
        await this.apiSvc.createExamAttempt( this.examConfig )
                  .then( res => {

                      console.log( "Exam attempt created" ) ;
                      console.log( res ) ;

                      for( let question of this.questions ) {
                          let questionId = question.questionConfig.id ;
                          question.examQuestionAttemptId = res.questionAttemptIds[ questionId ] ;
                      }

                      this.examAttemptId = res.examAttemptId ;
                      this.eventLogService.examAttemptId = res.examAttemptId ;
                      this.eventLogService.startTime = new Date() ;
                      this.eventLogService.logExamStartEvent() ;

                      // Set the first question as active question
                      this.activateQuestion( this.questions[0] ) ;
                      this.countdown() ;

                      return ;
                  }) ;
    }

    countdown() {
        if( this.timeLeftInSeconds() > 0 ) {
            setTimeout( () => {
                this.timeLeftInSeconds.set( this.timeLeftInSeconds()-1 ) ;
                this.activeQuestion.timeSpentInCurrentLap++ ;
                this.activeQuestion.totalTimeSpent++ ;
                this.countdown() ;
            }, 1000 ) ;
        }
        else {
            if( !this.examSubmitted ) {
                this.submitExamAttempt().then() ;
            }
        }
    }

    getNextLapName(): LapName|null {
        return this.LAP_TRANSITIONS[this.currentLap] ;
    }

    saveLapSnapshot() {

        let snapshots : {
            examQuestionId: number,
            timeSpentInCurrentLap: number,
            attemptState: string
        }[] = [] ;

        for( let question of this.questions ) {
            snapshots.push({
                examQuestionId : question.questionConfig.id,
                timeSpentInCurrentLap : question.timeSpentInCurrentLap,
                attemptState : question.state
            }) ;
            question.timeSpentInCurrentLap = 0 ;
        }

        this.apiSvc.saveLapSnapshot( this.examAttemptId, this.currentLap, snapshots )
            .then( ()=> console.log( 'Snapshots inserted' ) ) ;

        const nextLapName = this.getNextLapName() ;
        this.eventLogService.logLapChange( this.currentLap, nextLapName ) ;
        if( nextLapName != null ) {
            this.currentLap = nextLapName ;
        }
    }

    async submitExamAttempt() {
        if( this.examSubmitted ) {
          return ;
        }

        this.examSubmitted = true ;
        this.timeLeftInSeconds.set( 0 ) ;
        await this.eventLogService.logExamSubmitEvent() ;

        const res = await this.apiSvc.submitExamAttempt( this.examAttemptId ) ;
        console.log( res ) ;

        this.eval = res ;
        await this.router.navigate( [ '/jee-main', this.examConfig.id, 'result-screen' ] ) ;
    }

    public recomputeLossAttributionPct( examEval: ExamAttemptSO ) {

        const rcMap = this.buildRootCauseMap() ;

        const totalLoss = examEval.exam.totalMarks - examEval.score ;
        let totalAvoidableLoss = 0 ;

        // A perfect score leaves no loss to classify as avoidable or unavoidable.
        if( totalLoss == 0 ) {
            examEval.avoidableLossPct = 0 ;
            examEval.unavoidableLossPct = 0 ;
            return ;
        }

        for( let sectionAttempt of examEval.sectionAttempts ) {

            const sectionLoss = this.computeSectionLostMarks( sectionAttempt ) ;
            if( sectionLoss == 0 ) {
                sectionAttempt.avoidableLossPct = 0 ;
            }
            else {
                const sectionAvoidableLoss = this.computeSectionAvoidableLoss( sectionAttempt, rcMap ) ;
                totalAvoidableLoss += sectionAvoidableLoss ;
                sectionAttempt.avoidableLossPct = ( sectionAvoidableLoss / sectionLoss ) * 100 ;
            }

        }

        examEval.avoidableLossPct = (totalAvoidableLoss / totalLoss)*100 ;
        examEval.unavoidableLossPct = 100 - examEval.avoidableLossPct ;
    }

    private buildRootCauseMap() {
        const map: Record<string, string> = {} ;
        for( let rootCause of this.rootCauses ) {
            map[ rootCause.cause ] = rootCause.group ;
        }
        return map ;
    }

    private computeSectionAvoidableLoss( sectionAttempt: ExamSectionAttemptSO, rcMap: Record<string, string> ) {

        let avoidableLossMarks = 0 ;

        for( let qAttempt of sectionAttempt.questionAttempts ) {

            if( !this.hasAttributableLoss( qAttempt ) ) continue ;

            if( this.isAvoidableLoss( qAttempt, rcMap ) ) {
                avoidableLossMarks += (sectionAttempt.examSection.correctMarks - qAttempt.score) ;
            }
        }

        return avoidableLossMarks ;
    }

    private hasAttributableLoss( qAttempt: ExamQuestionAttemptSO ) {
        return qAttempt.evaluationStatus === "INCORRECT" ||
          qAttempt.evaluationStatus === "PARTIAL" ||
          qAttempt.evaluationStatus === "UNANSWERED" ;
    }

    private isAvoidableLoss( qAttempt: ExamQuestionAttemptSO, rcMap: Record<string, string> ) {
        // If a root cause is absent or unknown, keep the loss in the avoidable bucket.
        return qAttempt.rootCause == null ||
          rcMap[ qAttempt.rootCause ] !== "UNAVOIDABLE" ;
    }

    private computeSectionLostMarks( sectionAttempt: ExamSectionAttemptSO ) {
        const section = sectionAttempt.examSection ;
        const sectionTotalMarks = section.correctMarks * section.numCompulsoryQuestions ;
        return sectionTotalMarks - sectionAttempt.score ;
    }

    public overrideScore( examEval: ExamAttemptSO,
                          questionAttempt: ExamQuestionAttemptSO,
                          updatedScore: number ) {

        this.apiSvc.overrideScore( questionAttempt.id, updatedScore )
          .then( () => {
              this.overrideScoreLocally( examEval, questionAttempt, updatedScore ) ;
          }) ;
    }

    private overrideScoreLocally( examEval: ExamAttemptSO,
                                  questionAttempt: ExamQuestionAttemptSO,
                                  updatedScore: number ) {

        const sectionId = questionAttempt.examQuestion.sectionId ;
        const sectionAttempt = examEval.sectionAttempts.find(
          attempt => attempt.examSection.id === sectionId
        ) ;

        questionAttempt.score = updatedScore ;
        this.recomputeExamScore( examEval ) ;

        if( updatedScore == sectionAttempt!.examSection.correctMarks ) {
            questionAttempt.rootCause = null ;
            questionAttempt.evaluationStatus = "CORRECT" ;
        }
        else {
            if( updatedScore == sectionAttempt!.examSection.wrongPenalty ) {
                questionAttempt.evaluationStatus = "INCORRECT" ;
            }
            else {
                questionAttempt.evaluationStatus = "PARTIAL" ;
            }
        }
        this.recomputeLossAttributionPct( examEval ) ;
    }

    private recomputeExamScore( examEval: ExamAttemptSO ) {
        let totalScore = 0 ;
        for( let sectionAttempt of examEval.sectionAttempts ) {
            let sectionScore = 0 ;

            for( let questionAttempt of sectionAttempt.questionAttempts ) {
                sectionScore += questionAttempt.score ;
            }
            sectionAttempt.score = sectionScore ;
            totalScore += sectionScore ;
        }
        examEval.score = totalScore ;
    }
}
