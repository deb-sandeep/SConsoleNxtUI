import {
  PauseEnd,
  PauseStart,
  ProblemAttemptEnd,
  ProblemAttemptStart,
  SessionEnd,
  SessionStart
} from "../../service/response-payload.types";

export class Session {

  sessionId: number ;
  startTime: Date ;
  endTime: Date | null = null ;
  effectiveDuration: number = 0 ;
  sessionType: string ;
  syllabusName: string ;
  topicName: string ;

  events: (ProblemAttempt | Pause)[] = [] ;

  constructor( evt: SessionStart ) {
    this.sessionId = evt.sessionId ;
    this.startTime = new Date( evt.startTime ) ;
    this.sessionType = evt.sessionType ;
    this.syllabusName = evt.syllabusName ;
    this.topicName = evt.topicName ;
  }

  processEndEvent( evt : SessionEnd ) {
    this.endTime = new Date( evt.endTime ) ;
    this.effectiveDuration = evt.effectiveDuration ;
  }

  addProblemAttempt( pa : ProblemAttempt ) {
    this.events.unshift( pa ) ;
  }

  addPause( p: Pause ) {
    this.events.unshift( p ) ;
  }
}

export class ProblemAttempt {

  id:string ;

  sessionId: number ;
  problemAttemptId: number ;
  startTime: Date ;
  endTime: Date | null = null ;
  syllabusName: string ;
  topicName: string ;
  bookName: string ;
  chapterNum: number ;
  chapterName: string ;
  problemKey: string ;
  currentState: string ;
  effectiveDuration: number = 0 ;

  pauses: Pause[] = [] ;

  constructor( evt: ProblemAttemptStart ) {

    this.id = 'pat' + evt.problemAttemptId ;

    this.sessionId = evt.sessionId ;
    this.problemAttemptId = evt.problemAttemptId ;
    this.startTime = new Date( evt.startTime ) ;
    this.syllabusName = evt.syllabusName ;
    this.topicName = evt.topicName ;
    this.bookName = evt.bookName ;
    this.chapterNum = evt.chapterNum ;
    this.chapterName = evt.chapterName ;
    this.problemKey = evt.problemKey ;
    this.currentState = evt.currentState ;
  }

  processEndEvent( evt : ProblemAttemptEnd ) {
    this.endTime = new Date( evt.endTime ) ;
    this.effectiveDuration = evt.effectiveDuration ;
    this.currentState = evt.targetState ;
  }

  addPause( p: Pause ) {
    this.pauses.unshift( p ) ;
  }

  getObject():any {
    return this ;
  }
}

export class Pause {

  id: string ;

  sessionId: number ;
  pauseId: number ;
  startTime: Date ;
  endTime: Date | null = null ;
  duration: number = 0 ;

  constructor( evt: PauseStart ) {

    this.id = 'pau' + evt.pauseId ;

    this.sessionId = evt.sessionId ;
    this.pauseId = evt.pauseId ;
    this.startTime = new Date( evt.startTime ) ;
  }

  processEndEvent( evt : PauseEnd ) {
    this.endTime = new Date( evt.endTime ) ;
    this.duration = evt.duration ;
  }

  getObject():any {
    return this ;
  }
}