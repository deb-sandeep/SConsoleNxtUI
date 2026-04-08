import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  CreateExamAttemptResponse,
  ExamSO,
  ExamEvent,
  ExamQuestionSubmitStatus, LapName, ExamAttemptSO, WrongAnswerRootCause
} from "@jee-common/util/exam-data-types" ;
import { ExamQuestion } from "../../../app-jee-exam/src/common/so-wrappers";

@Injectable()
export class ExamApiService extends RemoteService {

  private examSessionId: number ;
  private examSessionStartTime: Date | null = null ;

  constructor() {
    super();
  }

  getListOfExams() {
    const url:string = `${environment.apiRoot}/Master/Exam/` ;
    return this.getPromise<ExamSO[]>( url ) ;
  }

  getListOfExamAttempts() {
    const url:string = `${environment.apiRoot}/Exam/Attempts` ;
    return this.getPromise<ExamAttemptSO[]>( url ) ;
  }

  async getExamDetails( examId : number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${examId}` ;
    return this.getPromise<ExamSO>( url ) ;
  }

  async createExamAttempt( exam : ExamSO ) {
    const url:string = `${environment.apiRoot}/Exam/${exam.id}/Attempt` ;
    return this.postPromise<CreateExamAttemptResponse>( url ) ;
  }

  async logEvent( event : ExamEvent ) {
    const url:string = `${environment.apiRoot}/Exam/EventLog` ;
    return this.postPromise<String>( url, event ) ;
  }

  async saveTimeSpent( question: ExamQuestion ) {
    const url:string = `${environment.apiRoot}/Exam/TimeUpdate` ;
    return this.postPromise<String>( url, {
      questionAttemptId: question.examQuestionAttemptId,
      timeSpent: question.totalTimeSpent
    } ) ;
  }

  async saveAnswerAction( question:ExamQuestion, status: ExamQuestionSubmitStatus, currentLap:LapName ) {
    const url:string = `${environment.apiRoot}/Exam/AnswerUpdate` ;
    return this.postPromise<String>( url, {
      questionAttemptId: question.examQuestionAttemptId,
      submitStatus: status,
      answerProvided: question.answer,
      answerSubmitLap: currentLap,
      timeSpent: question.totalTimeSpent
    } ) ;
  }

  async saveLapSnapshot( examAttemptId:number, currentLap:LapName, snapshots:any[] ) {

    const url:string = `${environment.apiRoot}/Exam/LapSnapshot` ;

    return this.postPromise<String>( url, {
      examAttemptId: examAttemptId,
      currentLap: currentLap,
      snapshots: snapshots,
    } ) ;
  }

  submitExamAttempt( examAttemptId: number ) {
    const url:string = `${environment.apiRoot}/Exam/${examAttemptId}/Submit` ;
    return this.postPromise<ExamAttemptSO>( url, true ) ;
  }

  fetchExamAttempt( examAttemptId:number ) {
    const url:string = `${environment.apiRoot}/Exam/Attempt/${examAttemptId}` ;
    return this.getPromise<ExamAttemptSO>( url, true ) ;
  }

  updateQuestionRating( questionId: number, rating: number ) {
    const url:string = `${environment.apiRoot}/Master/Question/Rating/${questionId}/${rating}` ;
    return this.postPromise<String>( url, false ) ;
  }

  getRootCauses() {
    const url:string = `${environment.apiRoot}/Master/Exam/RootCauses` ;
    return this.getPromise<WrongAnswerRootCause[]>( url ) ;
  }

  updateAttemptRootCause( questionAttemptId: number, rootCause: string ) {
    const url:string = `${environment.apiRoot}/Exam/RootCauseUpdate/${questionAttemptId}/${rootCause}` ;
    return this.postPromise<ExamAttemptSO>( url, true ) ;
  }

  overrideScore( questionAttemptId:number, score:number ) {
    const url:string = `${environment.apiRoot}/Exam/ScoreOverride/${questionAttemptId}/${score}` ;
    return this.postPromise<ExamAttemptSO>( url, true ) ;
  }

  async startExamSession() {
    const url:string = `${environment.apiRoot}/Session/StartExamSession` ;
    this.postPromise<number>( url )
        .then( sessionId => {
          this.examSessionId = sessionId ;
          this.examSessionStartTime = new Date() ;
        } ) ;
  }

  extendExamSession() {
    const url:string = `${environment.apiRoot}/Session/ExtendSession` ;

    const currentTime = new Date() ;
    let duration = currentTime.getTime() - this.examSessionStartTime!.getTime() ;

    this.postPromise<number>( url, {
      sessionId: this.examSessionId,
      endTime: currentTime,
      sessionEffectiveDuration: Math.ceil( duration /1000 ),
      pauseId: -1,
      problemAttemptId: -1,
      problemAttemptEffectiveDuration: 0
    } ).then()  ;
  }

  endExamSession() {
    const url:string = `${environment.apiRoot}/Session/${this.examSessionId}/EndSession` ;
    this.postPromise<number>( url )
        .then( () => {
          this.examSessionId = -1 ;
          this.examSessionStartTime = null ;
        }) ;
  }
}
