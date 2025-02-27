import { Injectable } from '@angular/core';
import { RemoteService } from "lib-core";

import { environment } from "@env/environment";
import { SessionTypeSO, SyllabusSO, TopicTrackAssignmentSO } from "@jee-common/master-data-types";
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

  startNewSession( session: Session ) {
    const url:string = `${environment.apiRoot}/Master/Session/NewSession` ;
    return this.postPromise<number>( url, {
      sessionType: session.sessionType?.sessionType,
      topicId: session.topic()!.id,
      syllabusName: session.syllabus()!.syllabusName,
      startTime: dayjs( session.startTime ).add( dayjs().utcOffset(), 'minutes' ).toDate()
    } ) ;
  }
}