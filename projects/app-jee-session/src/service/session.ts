import { SessionPauseSO, SessionTypeSO, SyllabusSO, TopicSO } from "@jee-common/master-data-types";
import { signal } from "@angular/core";

export class Session {

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;

  sessionId:number = -1 ; // <=0 => session not started
  startTime:Date ;
  endTime:Date ;
  pauses:SessionPauseSO[] = [] ;
  effectiveDuration:number = 0 ;

  currentPause:SessionPauseSO|null = null ;

  constructor() {
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
  }

  startSession() {
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
    this.effectiveDuration = 0 ;
  }

  endSession() {
    this.endTime = new Date() ;
    this.currentPause = null ;
    this.computeEffectiveDuration() ;
  }

  startPause( pause: SessionPauseSO ) {
    this.pauses.push(pause) ;
    this.currentPause = pause ;
    this.updateContinuationTime() ;
  }

  isPaused() {
    return this.currentPause != null ;
  }

  endPause() {
    this.currentPause!.endTime = new Date() ;
    this.currentPause = null ;
    this.updateContinuationTime() ;
  }

  updateContinuationTime() {
    const currentTime = new Date() ;
    this.endTime = currentTime ;
    if( this.currentPause != null ) {
      this.currentPause!.endTime = currentTime ;
    }
    // TODO: The same for problem attempt

    this.computeEffectiveDuration() ;
  }

  private computeEffectiveDuration() {
    const totalDuration = this.endTime.getTime() - this.startTime.getTime() ;
    const pauseDuration = this.pauses.reduce( (total:number, pause:SessionPauseSO) => {
      return total + ( pause.endTime.getTime() - pause.startTime.getTime() ) ;
    }, 0 ) ;
    this.effectiveDuration = ( totalDuration - pauseDuration )/1000 ;
  }
}