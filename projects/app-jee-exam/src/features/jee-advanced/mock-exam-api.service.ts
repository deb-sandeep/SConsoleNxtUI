import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APIResponse } from "lib-core";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { CreateExamAttemptResponse, ExamEvent, ExamQuestionSubmitStatus, ExamSO, LapName } from "@jee-common/util/exam-data-types";
import { ExamQuestion } from "../../common/so-wrappers";

@Injectable()
export class MockExamApiService extends ExamApiService {

  override async getExamDetails( examId: number ) {
    console.log( '[MockExamApiService] Master/Exam/', { examId } ) ;
    const envelope = await firstValueFrom( this.http.get<APIResponse>( 'mock-data/jee-advanced-exam-config.json' ) ) ;
    return envelope.data as ExamSO ;
  }

  override async createExamAttempt( exam: ExamSO ) {
    console.log( '[MockExamApiService] Exam/Attempt', { examId: exam.id } ) ;

    const questionAttemptIds: Record<number, number> = {} ;
    let nextId = 1 ;
    for( const section of exam.sections )
      for( const question of section.questions )
        questionAttemptIds[ question.id ] = nextId++ ;

    const response: CreateExamAttemptResponse = {
      examId: exam.id,
      examAttemptId: -1,
      questionAttemptIds
    } ;
    return response ;
  }

  override async startExamSession() {
    console.log( '[MockExamApiService] Session/StartExamSession' ) ;
  }

  override extendExamSession() {
    console.log( '[MockExamApiService] Session/ExtendSession' ) ;
  }

  override endExamSession() {
    console.log( '[MockExamApiService] Session/EndSession' ) ;
  }

  override async logEvent( event: ExamEvent ) {
    console.log( '[MockExamApiService] Exam/EventLog', event ) ;
    return "" ;
  }

  override async saveTimeSpent( question: ExamQuestion ) {
    console.log( '[MockExamApiService] Exam/TimeUpdate', {
      questionAttemptId: question.examQuestionAttemptId,
      timeSpent: question.totalTimeSpent
    } ) ;
    return "" ;
  }

  override async saveAnswerAction( question: ExamQuestion, status: ExamQuestionSubmitStatus, currentLap: LapName ) {
    console.log( '[MockExamApiService] Exam/AnswerUpdate', {
      questionAttemptId: question.examQuestionAttemptId,
      submitStatus: status,
      answerProvided: question.answer,
      answerSubmitLap: currentLap,
      timeSpent: question.totalTimeSpent
    } ) ;
    return "" ;
  }

  override async saveLapSnapshot( examAttemptId: number, currentLap: LapName, snapshots: any[] ) {
    console.log( '[MockExamApiService] Exam/LapSnapshot', {
      examAttemptId,
      currentLap,
      snapshots
    } ) ;
    return "" ;
  }

  override async updateQuestionRating( questionId: number, rating: number ) {
    console.log( '[MockExamApiService] Master/Question/Rating', { questionId, rating } ) ;
    return "" ;
  }

  override async updateAttemptRootCause( questionAttemptId: number, rootCause: string ) {
    console.log( '[MockExamApiService] Exam/RootCauseUpdate', { questionAttemptId, rootCause } ) ;
    return null as any ;
  }

  override async getRootCauses() {
    console.log( '[MockExamApiService] Master/Exam/RootCauses' ) ;
    return [] ;
  }

  override async getQAttemptLapAnalysisObservationList() {
    console.log( '[MockExamApiService] Master/Exam/QAttemptLapAnalysisObservations' ) ;
    return [] ;
  }
}
