import { SessionTypeSO, SyllabusSO, TopicSO } from "@jee-common/master-data-types";
import { signal } from "@angular/core";

export class SessionPause {
  startTime:Date ;
  endTime:Date ;

  constructor() {
    this.endTime = this.startTime = new Date() ;
  }

  continue() {
    this.endTime = new Date() ;
  }
}

export class Session {

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;

  sessionId:number = -1 ; // <=0 => session not started
  pauses:SessionPause[] = [] ;

  constructor() {}

  addPause():SessionPause {
    const pause = new SessionPause() ;
    this.pauses.push( pause ) ;
    return pause ;
  }
}