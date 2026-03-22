import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  CreateExamAttemptResponse,
  ExamConfig,
  ExamEvent,
  ExamQuestionSubmitStatus, LapName
} from "@jee-common/util/exam-data-types" ;
import { ExamQuestion } from "../common/so-wrappers";

@Injectable()
export class ExamApiService extends RemoteService {

  constructor() {
    super();
  }

  getListOfExams() {
    const url:string = `${environment.apiRoot}/Master/Exam/` ;
    return this.getPromise<ExamConfig[]>( url ) ;
  }

  async getExamDetails( examId : number ) {
    const url:string = `${environment.apiRoot}/Master/Exam/${examId}` ;
    return this.getPromise<ExamConfig>( url ) ;
  }

  async createExamAttempt( exam : ExamConfig ) {
    // const url:string = `${environment.apiRoot}/Exam/Attempt/${exam.id}` ;
    // return this.postPromise<CreateExamAttemptResponse>( url ) ;

    let dummyResponse: CreateExamAttemptResponse = {
      examId: 1,
      examAttemptId: 5,
      questionAttemptIds: {
        1: 61,
        2: 62,
        3: 63,
        4: 64,
        5: 65,
        6: 66,
        7: 67,
        8: 68,
        9: 69,
        10: 70,
        11: 71,
        12: 72,
        13: 73,
        14: 74,
        15: 75
      }
    } ;
    return dummyResponse ;
  }

  async logEvent( event : ExamEvent ) {
    const url:string = `${environment.apiRoot}/Exam/EventLog` ;
    return this.postPromise<String>( url, event ) ;
  }

  async logAnswerAction( question:ExamQuestion, status: ExamQuestionSubmitStatus ) {
    const url:string = `${environment.apiRoot}/Exam/AnswerUpdate` ;
    question.updateTimeSpent() ;

    return this.postPromise<String>( url, {
      questionAttemptId: question.examQuestionAttemptId,
      submitStatus: status,
      answerProvided: question.answer,
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
}