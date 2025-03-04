import {
  ProblemAttemptSO,
  SessionPauseSO,
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicSO
} from "@jee-common/master-data-types";
import { signal } from "@angular/core";

export class Session {

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;

  sessionId:number = -1 ; // <=0 => session not started
  startTime:Date ;
  endTime:Date ;
  effectiveDuration:number = 0 ;
  problems: TopicProblemSO[] = [] ;

  pauses:SessionPauseSO[] = [] ;
  problemAttempts:ProblemAttemptSO[] = [] ;

  currentPause:SessionPauseSO|null = null ;

  currentProblemAttempt:ProblemAttemptSO|null = null ;
  pausesDuringCurrentProblemAttempt:SessionPauseSO[] = [] ;

  constructor() {
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
  }

  isPaused() {
    return this.currentPause != null ;
  }

  isInProblemAttemptMode() {
    return this.currentProblemAttempt != null ;
  }

  hasProblems() {
    return this.problems.length > 0 ;
  }

  startSession() {
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
    this.effectiveDuration = 0 ;
    this.currentProblemAttempt = null ;
    this.pausesDuringCurrentProblemAttempt = [] ;
  }

  endSession() {
    this.endTime = new Date() ;
    this.currentPause = null ;
    this.computeEffectiveSessionDuration() ;
  }

  startPause( pause: SessionPauseSO ) {
    this.pauses.push(pause) ;
    this.currentPause = pause ;
    if( this.currentProblemAttempt != null ){
      this.pausesDuringCurrentProblemAttempt.push( this.currentPause ) ;
    }
    this.updateContinuationTime() ;
  }

  endPause() {
    this.currentPause!.endTime = new Date() ;
    this.currentPause = null ;
    this.updateContinuationTime() ;
  }

  startProblemAttempt( pa: ProblemAttemptSO ) {
    this.problemAttempts.push( pa ) ;
    this.currentProblemAttempt = pa ;
    this.pausesDuringCurrentProblemAttempt = [] ;
    this.updateContinuationTime() ;
  }

  endProblemAttempt() {
    this.currentProblemAttempt!.endTime = new Date() ;
    this.updateContinuationTime() ;
    this.pausesDuringCurrentProblemAttempt = [] ;
  }

  updateContinuationTime() {
    const currentTime = new Date() ;
    this.endTime = currentTime ;
    if( this.currentPause != null ) {
      this.currentPause!.endTime = currentTime ;
    }
    if( this.currentProblemAttempt != null ) {
      this.currentProblemAttempt!.endTime = currentTime ;
      this.computeEffectiveProblemAttemptDuration() ;
    }
    this.computeEffectiveSessionDuration() ;
  }

  private computeEffectiveSessionDuration() {
    const totalDuration = this.endTime.getTime() - this.startTime.getTime() ;
    const pauseDuration = this.pauses.reduce( (total:number, pause:SessionPauseSO) => {
      return total + ( pause.endTime.getTime() - pause.startTime.getTime() ) ;
    }, 0 ) ;
    this.effectiveDuration = ( totalDuration - pauseDuration )/1000 ;
  }

  private computeEffectiveProblemAttemptDuration() {
    if( this.currentProblemAttempt != null ){
      const cpa = this.currentProblemAttempt ;
      const cpaPauses = this.pausesDuringCurrentProblemAttempt ;
      const totalDuration = cpa.endTime.getTime() - cpa.startTime.getTime() ;
      const pauseDuration = cpaPauses.reduce( (total:number, pause:SessionPauseSO) => {
        return total + ( pause.endTime.getTime() - pause.startTime.getTime() ) ;
      }, 0 ) ;
      cpa.effectiveDuration = ( totalDuration - pauseDuration )/1000 ;
    }
  }
}