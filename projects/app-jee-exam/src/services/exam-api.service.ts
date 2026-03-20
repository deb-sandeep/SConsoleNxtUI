import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  CreateExamAttemptResponse,
  ExamConfig,
  ExamEvent,
  ExamQuestionSubmitStatus
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
    //return this.postPromise<CreateExamAttemptResponse>( url ) ;

    let dummyResponse: CreateExamAttemptResponse = {
      examId: 1,
      examAttemptId: 4,
      questionAttemptIds: {
        1: 46,
        2: 47,
        3: 48,
        4: 49,
        5: 50,
        6: 51,
        7: 52,
        8: 53,
        9: 54,
        10: 55,
        11: 56,
        12: 57,
        13: 58,
        14: 59,
        15: 60
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
      timeSpent: question.timeSpent
    } ) ;
  }
}