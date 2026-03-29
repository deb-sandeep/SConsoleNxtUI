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

  async logAnswerAction( question:ExamQuestion, status: ExamQuestionSubmitStatus, currentLap:LapName ) {
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
    return this.postPromise<String>( url, false ) ;
  }

  overrideScore( questionAttemptId:number, score:number ) {
    const url:string = `${environment.apiRoot}/Exam/ScoreOverride/${questionAttemptId}/${score}` ;
    return this.postPromise<String>( url, false ) ;
  }
}
