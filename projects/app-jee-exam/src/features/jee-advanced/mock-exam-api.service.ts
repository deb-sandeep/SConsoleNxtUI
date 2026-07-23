import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APIResponse } from "lib-core";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { CreateExamAttemptResponse, ExamSO } from "@jee-common/util/exam-data-types";

@Injectable()
export class MockExamApiService extends ExamApiService {

  override async getExamDetails( examId: number ) {
    const envelope = await firstValueFrom( this.http.get<APIResponse>( 'mock-data/jee-advanced-exam-config.json' ) ) ;
    return envelope.data as ExamSO ;
  }

  override async createExamAttempt( exam: ExamSO ) {
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

  override async startExamSession() { /* no-op in mock mode */ }
  override extendExamSession() { /* no-op in mock mode */ }
  override endExamSession() { /* no-op in mock mode */ }

  override async logEvent() { return "" ; }
  override async saveTimeSpent() { return "" ; }
  override async saveAnswerAction() { return "" ; }
  override async saveLapSnapshot() { return "" ; }
  override async updateQuestionRating() { return "" ; }
  override async updateAttemptRootCause() { return null as any ; }

  override async getRootCauses() { return [] ; }
  override async getQAttemptLapAnalysisObservationList() { return [] ; }
}
