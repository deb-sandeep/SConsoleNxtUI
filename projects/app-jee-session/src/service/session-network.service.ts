import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicTrackAssignmentSO
} from "@jee-common/util/master-data-types";
import dayjs from "dayjs";
import { Session } from "../entities/session";
import { Pause } from "../entities/pause";
import { ProblemAttempt } from "../entities/problem-attempt";
import { NewProblemAttemptResponse } from "./server-response.type";

@Injectable()
export class SessionNetworkService extends RemoteService {

  getAllSyllabus() : Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise<SyllabusSO[]>( url, true ) ;
  }

  getSessionTypes() : Promise<SessionTypeSO[]> {
    const url:string = `${environment.apiRoot}/Session/Types` ;
    return this.getPromise<SessionTypeSO[]>( url, true ) ;
  }

  getCurrentTrackAssignments( date:Date ) : Promise<TopicTrackAssignmentSO[]> {
    const dateStr = dayjs( date ).format( 'YYYY-MM-DD' ) ;
    const url:string = `${environment.apiRoot}/Master/Track/CurrentTopicAssignments?date=${dateStr}` ;
    return this.getPromise<TopicTrackAssignmentSO[]>( url, true ) ;
  }

  getPigeonsForSession( session: Session ) : Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Session/${session.sessionId}/PigeonedProblems` ;
    return this.getPromise<TopicProblemSO[]>( url ) ;
  }

  getActiveProblemsForSession( session: Session ) : Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Session/${session.sessionId}/ActiveProblems` ;
    return this.getPromise<TopicProblemSO[]>( url ) ;
  }

  getActiveProblemsForTopic( topicId:number ) : Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Topic/${topicId}/ActiveProblems` ;
    return this.getPromise<TopicProblemSO[]>( url ) ;
  }

  startSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Session/StartSession` ;
    return this.postPromise<number>( url, {
      sessionType: session.sessionType?.sessionType,
      topicId: session.topic()!.id,
      syllabusName: session.syllabus()!.syllabusName,
      startTime: this.utcAdjustedTime( session.startTime )
    } ) ;
  }

  endSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Session/${session.sessionId}/EndSession` ;
    return this.postPromise<number>( url ) ;
  }

  extendSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Session/ExtendSession` ;

    let pauseId = -1 ;
    let problemAttemptId = -1 ;
    let problemAttemptEffectiveDuration = 0 ;

    if( session.currentPause != null ) {
      pauseId = session.currentPause.id ;
    }

    if( session.currentProblemAttempt != null ) {
      problemAttemptId = session.currentProblemAttempt.id ;
      problemAttemptEffectiveDuration = Math.ceil( session.currentProblemAttempt.effectiveDuration()/1000 ) ;
    }

    return this.postPromise<number>( url, {
      sessionId: session.sessionId,
      endTime: this.utcAdjustedTime( session.endTime ),
      sessionEffectiveDuration: Math.ceil(session.effectiveDuration()/1000),
      pauseId: pauseId,
      problemAttemptId: problemAttemptId,
      problemAttemptEffectiveDuration: problemAttemptEffectiveDuration
    } ) ;
  }

  startPause( pause: Pause ) {
    const url:string = `${environment.apiRoot}/Session/StartPause` ;
    return this.postPromise<number>( url, {
      sessionId: pause.sessionId,
      startTime: this.utcAdjustedTime( pause.startTime ),
    } ) ;
  }

  endPause( pause: Pause ) {
    const url:string = `${environment.apiRoot}/Session/EndPause` ;
    return this.postPromise<number>( url, {
      sessionId: pause.sessionId,
      startTime: this.utcAdjustedTime( pause.endTime ),
    } ) ;
  }

  startProblemAttempt( pa: ProblemAttempt ) {

    const url:string = `${environment.apiRoot}/Session/StartProblemAttempt` ;
    return this.postPromise<NewProblemAttemptResponse>( url,  {
      id: -1,
      sessionId: pa.sessionId,
      problemId: pa.problem.problemId,
      startTime: this.utcAdjustedTime( pa.startTime ),
      endTime: this.utcAdjustedTime( pa.endTime ),
      effectiveDuration: 0,
      prevState: pa.prevState,
      targetState: pa.targetState,
    } ) ;
  }

  endProblemAttempt( pa: ProblemAttempt ) {

    const url:string = `${environment.apiRoot}/Session/EndProblemAttempt` ;
    return this.postPromise<number>( url,  {
      id: pa.id,
      targetState: pa.targetState,
    } ) ;
  }

  private utcAdjustedTime( time:Date ) {
    return time ;
    //return dayjs( time ).add( dayjs().utcOffset(), 'minutes' ).toDate() ;
  }

  updateProblemDifficultyLevel( problemId: number, difficultyLevel: number ) {
    const url:string = `${environment.apiRoot}/Master/Problem/${problemId}/DifficultyLevel/${difficultyLevel}` ;
    return this.postPromise<void>( url ) ;
  }
}