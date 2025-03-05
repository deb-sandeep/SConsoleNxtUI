import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import {
  ProblemAttemptSO,
  SessionPauseSO,
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicTrackAssignmentSO
} from "@jee-common/master-data-types";
import dayjs from "dayjs";
import { Session } from "./session";

@Injectable()
export class SessionNetworkService extends RemoteService {

  getAllSyllabus() : Promise<SyllabusSO[]> {
    const url:string = `${environment.apiRoot}/Master/Syllabus/All` ;
    return this.getPromise<SyllabusSO[]>( url, true ) ;
  }

  getSessionTypes() : Promise<SessionTypeSO[]> {
    const url:string = `${environment.apiRoot}/Master/Session/Types` ;
    return this.getPromise<SessionTypeSO[]>( url, true ) ;
  }

  getCurrentTrackAssignments( date:Date ) : Promise<TopicTrackAssignmentSO[]> {
    const dateStr = dayjs( date ).add( dayjs().utcOffset(), 'minutes' ).format( 'YYYY-MM-DD' ) ;
    const url:string = `${environment.apiRoot}/Master/Track/CurrentTopicAssignments?date=${dateStr}` ;
    return this.getPromise<TopicTrackAssignmentSO[]>( url, true ) ;
  }

  getPigeonsForSession( session: Session ) : Promise<TopicProblemSO[]> {
    const url:string = `${environment.apiRoot}/Master/Session/${session.sessionId}/PigeonedProblems` ;
    return this.getPromise<TopicProblemSO[]>( url ) ;
  }

  startSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Master/Session/StartSession` ;
    return this.postPromise<number>( url, {
      sessionType: session.sessionType?.sessionType,
      topicId: session.topic()!.id,
      syllabusName: session.syllabus()!.syllabusName,
      startTime: this.utcAdjustedTime( session.startTime )
    } ) ;
  }

  extendSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Master/Session/ExtendSession` ;

    let pauseId = -1 ;
    let problemAttemptId = -1 ;
    let problemAttemptEffectiveDuration = 0 ;

    if( session.currentPause != null ) {
      pauseId = session.currentPause.id ;
    }

    if( session.currentProblemAttempt != null ) {
      problemAttemptId = session.currentProblemAttempt.id ;
      problemAttemptEffectiveDuration = session.currentProblemAttempt.effectiveDuration ;
    }

    return this.postPromise<number>( url, {
      sessionId: session.sessionId,
      endTime: this.utcAdjustedTime( session.endTime ),
      sessionEffectiveDuration: session.effectiveDuration(),
      pauseId: pauseId,
      problemAttemptId: problemAttemptId,
      problemAttemptEffectiveDuration: problemAttemptEffectiveDuration
    } ) ;
  }

  startPause( pause: SessionPauseSO ) {
    const url:string = `${environment.apiRoot}/Master/Session/StartPause` ;
    return this.postPromise<number>( url, {
      sessionId: pause.sessionId,
      startTime: this.utcAdjustedTime( pause.startTime ),
    } ) ;
  }

  endPause( pause: SessionPauseSO ) {
    const url:string = `${environment.apiRoot}/Master/Session/EndPause` ;
    return this.postPromise<number>( url, {
      id: pause.id,
      sessionId: pause.sessionId,
      endTime: this.utcAdjustedTime( pause.endTime ),
    } ) ;
  }

  startProblemAttempt( pa: ProblemAttemptSO ) {

    const url:string = `${environment.apiRoot}/Master/Session/StartProblemAttempt` ;
    return this.postPromise<number>( url,  {
      id: -1,
      sessionId: pa.sessionId,
      problemId: pa.problemId,
      startTime: this.utcAdjustedTime( pa.startTime ),
      endTime: this.utcAdjustedTime( pa.endTime ),
      effectiveDuration: 0,
      prevState: pa.prevState,
      targetState: pa.targetState,
    } ) ;
  }

  private utcAdjustedTime( time:Date ) {
    return dayjs( time ).add( dayjs().utcOffset(), 'minutes' ).toDate() ;
  }
}