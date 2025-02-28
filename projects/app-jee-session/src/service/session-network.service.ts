import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SessionPauseSO, SessionTypeSO, SyllabusSO, TopicTrackAssignmentSO } from "@jee-common/master-data-types";
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

  startSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Master/Session/StartSession` ;
    return this.postPromise<number>( url, {
      sessionType: session.sessionType?.sessionType,
      topicId: session.topic()!.id,
      syllabusName: session.syllabus()!.syllabusName,
      startTime: dayjs( session.startTime ).add( dayjs().utcOffset(), 'minutes' ).toDate()
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

    return this.postPromise<number>( url, {
      sessionId: session.sessionId,
      endTime: dayjs( session.endTime ).add( dayjs().utcOffset(), 'minutes' ).toDate(),
      sessionEffectiveDuration: session.effectiveDuration,
      pauseId: pauseId,
      problemAttemptId: problemAttemptId,
      problemAttemptEffectiveDuration: problemAttemptEffectiveDuration
    } ) ;
  }

  startPause( pause: SessionPauseSO ) {
    const url:string = `${environment.apiRoot}/Master/Session/StartPause` ;
    return this.postPromise<number>( url, {
      sessionId: pause.sessionId,
      startTime: dayjs( pause.startTime ).add( dayjs().utcOffset(), 'minutes' ).toDate()
    } ) ;
  }

  endPause( pause: SessionPauseSO ) {
    const url:string = `${environment.apiRoot}/Master/Session/EndPause` ;
    return this.postPromise<number>( url, {
      id: pause.id,
      sessionId: pause.sessionId,
      endTime: dayjs( pause.endTime ).add( dayjs().utcOffset(), 'minutes' ).toDate()
    } ) ;
  }

}