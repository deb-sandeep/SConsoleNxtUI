import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicTrackAssignmentSO
} from "@jee-common/master-data-types";
import dayjs from "dayjs";
import { Session } from "../entities/session";
import { Pause } from "../entities/pause";
import { ProblemAttempt } from "../entities/problem-attempt";

@Injectable()
export class SessionNetworkService extends RemoteService {

  getAllSyllabus() : Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Syllabus/All` ;
    return this.getPromise<SyllabusSO[]>( url, true ) ;
  }

  getSessionTypes() : Promise<SessionTypeSO[]> {
    const url:string = `${environment.apiRoot}/Session/Types` ;
    return this.getPromise<SessionTypeSO[]>( url, true ) ;
  }

  getCurrentTrackAssignments( date:Date ) : Promise<TopicTrackAssignmentSO[]> {
    const dateStr = dayjs( date ).add( dayjs().utcOffset(), 'minutes' ).format( 'YYYY-MM-DD' ) ;
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

  startSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Session/StartSession` ;
    return this.postPromise<number>( url, {
      sessionType: session.sessionType?.sessionType,
      topicId: session.topic()!.id,
      syllabusName: session.syllabus()!.syllabusName,
      startTime: this.utcAdjustedTime( session.startTime )
    } ) ;
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

  startProblemAttempt( pa: ProblemAttempt ) {

    const url:string = `${environment.apiRoot}/Session/StartProblemAttempt` ;
    return this.postPromise<number>( url,  {
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
    return dayjs( time ).add( dayjs().utcOffset(), 'minutes' ).toDate() ;
  }
}