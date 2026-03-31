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

    public overrideScore( examEval: ExamAttemptSO,
                          questionAttempt: ExamQuestionAttemptSO,
                          updatedScore: number ) {

        this.apiSvc.overrideScore( questionAttempt.id, updatedScore )
          .then( ( res ) => {
              this.repopulateExamEvaluation( examEval, res ) ;
          }) ;
    }

    public repopulateExamEvaluation( examEval: ExamAttemptSO, refEval: ExamAttemptSO ) {

        examEval.score = refEval.score ;
        examEval.loss = refEval.loss ;
        examEval.avoidableLoss = refEval.avoidableLoss ;
        examEval.avoidableLossPct = refEval.avoidableLossPct ;

        for( let refSection of refEval.sectionAttempts ) {

            const examSection = examEval.sectionAttempts.find(
              s => s.examSection.id === refSection.examSection.id
            );

            if( examSection ) {

                examSection.score = refSection.score;
                examSection.loss = refSection.loss;
                examSection.avoidableLoss = refSection.avoidableLoss;
                examSection.avoidableLossPct = refSection.avoidableLossPct;

                for( let refQuestion of refSection.questionAttempts ) {

                    const examQuestion = examSection.questionAttempts.find(
                      q => q.examQuestion.id === refQuestion.examQuestion.id
                    );

                    if( examQuestion ) {
                        examQuestion.score = refQuestion.score;
                        examQuestion.loss = refQuestion.loss;
                        examQuestion.avoidableLoss = refQuestion.avoidableLoss;
                        examQuestion.evaluationStatus = refQuestion.evaluationStatus;
                        examQuestion.rootCause = refQuestion.rootCause;
                    }
                }
            }
        }
    }
}
