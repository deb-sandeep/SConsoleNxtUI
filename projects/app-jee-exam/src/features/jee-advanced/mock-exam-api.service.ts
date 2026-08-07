import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APIResponse } from "lib-core";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import {
  CreateExamAttemptResponse, ExamAttemptSO, ExamEvent,
  ExamQuestionSubmitStatus, ExamSO, LapName
} from "@jee-common/util/exam-data-types";
import { ExamQuestion } from "../../common/so-wrappers";

@Injectable()
export class MockExamApiService extends ExamApiService {

  // Cached so submitExamAttempt()/fetchExamAttempt() can synthesize an
  // ExamAttemptSO shaped after the same exam the candidate actually took.
  private mockExam: ExamSO | null = null ;

  override async getExamDetails( examId: number ) {
    console.log( '[MockExamApiService] Master/Exam/', { examId } ) ;
    const envelope = await firstValueFrom( this.http.get<APIResponse>( 'mock-data/jee-advanced-exam-config.json' ) ) ;
    this.mockExam = envelope.data as ExamSO ;
    return this.mockExam ;
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

  override async submitExamAttempt( examAttemptId: number ) {
    console.log( '[MockExamApiService] Exam/Submit', { examAttemptId } ) ;
    return this.loadMockExamAttempt( examAttemptId ) ;
  }

  override async fetchExamAttempt( examAttemptId: number ) {
    console.log( '[MockExamApiService] Exam/Attempt/', { examAttemptId } ) ;
    return this.loadMockExamAttempt( examAttemptId ) ;
  }

  // A captured, realistic ExamAttemptSO (25 correct / 7 incorrect / 4 unanswered
  // across the same 36 questions as jee-advanced-exam-config.json, with a full
  // events timeline) - generated to match this mock exam so the result screen's
  // section/question/time-sequence panels render real-looking data instead of
  // an all-zero stub. See mock-data/jee-advanced-eval.json.
  private async loadMockExamAttempt( examAttemptId: number ): Promise<ExamAttemptSO> {
    const envelope = await firstValueFrom( this.http.get<APIResponse>( 'mock-data/jee-advanced-eval.json' ) ) ;
    const eval_ = envelope.data as ExamAttemptSO ;
    eval_.id = examAttemptId ;
    for( const sectionAttempt of eval_.sectionAttempts ) {
      sectionAttempt.examAttemptId = examAttemptId ;
    }
    return eval_ ;
  }
}
