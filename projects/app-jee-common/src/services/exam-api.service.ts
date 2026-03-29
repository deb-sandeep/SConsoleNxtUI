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

  async getExamDetails( examId : number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${examId}` ;
    return this.getPromise<ExamSO>( url ) ;
  }

  async createExamAttempt( exam : ExamSO ) {
    console.log( "***SCAFFOLD*** Remove the commented lines" ) ;
    // const url:string = `${environment.apiRoot}/Exam/${exam.id}/Attempt` ;
    // return this.postPromise<CreateExamAttemptResponse>( url ) ;

    let dummyResponse: CreateExamAttemptResponse = {
      examId: 1,
      examAttemptId: 7,
      questionAttemptIds: {
        1: 76,
        2: 77,
        3: 78,
        4: 79,
        5: 80,
        6: 81,
        7: 82,
        8: 83,
        9: 84,
        10: 85,
        11: 86,
        12: 87,
        13: 88,
        14: 89,
        15: 90
      }
    } ;
    return dummyResponse ;
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
    console.log( "***SCAFFOLD*** Change URL" ) ;
    //const url:string = `${environment.apiRoot}/Exam/${examAttemptId}/Submit` ;
    const url:string = `${environment.apiRoot}/Exam/7/Submit` ;
    return this.postPromise<ExamAttemptSO>( url, true ) ;
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
