import {
  ProblemAttemptSO,
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicSO
} from "@jee-common/master-data-types";
import { inject, signal } from "@angular/core";
import { SessionNetworkService } from "./session-network.service";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/storage-keys";
import { TimerService } from "./timer.service";
import { Subscription } from "rxjs" ;
import { Pause } from "./pause";

export class SessionError extends Error {
  constructor( msg: string ) {
    super( msg );
  }
}

type assertionFn  = (() => boolean) ;
type assertionSrc = assertionFn | boolean ;
type assertionResult = {
  elseThrow: (msg:string)=>void
} ;

export class Session {

  private timerSvc:TimerService = inject( TimerService ) ;
  private tickHandle:Subscription | null = null ;

  private networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;
  private localStorageSvc: LocalStorageService = inject( LocalStorageService ) ;

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;
  problems: TopicProblemSO[] = [] ;

  sessionId:number = -1 ; // <=0 => session not started
  startTime:Date = new Date() ;
  endTime:Date = new Date() ;

  problemAttempts:ProblemAttemptSO[] = [] ;
  pauses:Pause[] = [] ;
  pausesDuringCurrentProblemAttempt:Pause[] = [] ;

  currentPause: Pause|null = null ;
  currentProblem:TopicProblemSO|null = null ;
  currentProblemAttempt:ProblemAttemptSO|null = null ;

  effectiveDuration = signal<number>(0) ;
  currentProblemAttemptsDuration = signal<number>(0) ;

  constructor() {}

  // -------------- Check and throw error functions -------------------------------

  private assertStates( ...assertionSources: assertionSrc[] ): assertionResult {

    let assertionValid = true ;
    for( let i=0; i < assertionSources.length; i++ ) {
      let assertionSrc = assertionSources[ i ];
      if( typeof assertionSrc === 'boolean') {
        if( !assertionSrc ) {
          assertionValid = false ;
          break ;
        }
      }
      else {
        const assFn = assertionSrc as assertionFn ;
        if( !assFn() ) {
          assertionValid = false ;
          break ;
        }
      }
    }

    return {
      elseThrow: ( msg:string )=> {
        if( !assertionValid ) {
          throw new SessionError( msg )
        }
      },
    }
  }

  // ------------- Session state query methods ----------------------------------

  public isPaused() {
    return this.currentPause != null ;
  }

  public isInProblemAttemptMode() {
    return this.currentProblemAttempt != null ;
  }

  public hasProblems() {
    return this.problems.length > 0 ;
  }

  public isActive() {
    return this.sessionId != -1 ;
  }

  public isInactive() {
    return !this.isActive() ;
  }

  // -------------- Session Configuration -----------------------------------------

  public setSelectedSessionType( st: SessionTypeSO ) {
    this.assertStates( this.isInactive() )
        .elseThrow( "Can't set session type on active session." ) ;

    this.sessionType = st ;
    this.localStorageSvc.setItem( StorageKey.LAST_SESSION_TYPE, st.sessionType ) ;
  }

  public setSelectedSyllabus( s: SyllabusSO ) {
    this.assertStates( this.isInactive() )
        .elseThrow( "Can't set syllabus on active session." ) ;

    this.syllabus.set( s ) ;
    this.topic.set( null ) ;
  }

  public async setSelectedTopic( t: TopicSO ) {
    this.assertStates( this.isInactive() )
        .elseThrow( "Can't set topic on active session." ) ;

    this.topic.set( t ) ;
  }

  public async fetchPigeons() {
    this.problems = await this.networkSvc.getPigeonsForSession( this ) ;
  }

  // ------------- Timer callback -------------------------------------------------
  private sessionTick( tickCount:number ) {
    this.updateContinuationTime( tickCount%5 == 0 ) ;
  }

  // -------------- Session operations --------------------------------------------
  // - Start / Stop
  // - Pause / Resume
  // - Extend duration
  // - Start Problem Attempt
  //      - Pause / Resume
  //      - End
  //           - Correct Answer
  //           - Incorrect Answer
  //           - Attempt Later
  //           - Pigeon
  //           - Pigeon Kill
  //           - Purge
  //           - Reassign
  //           - Redo

  public async start() {

    this.assertStates( this.isInactive() )
        .elseThrow( "Can't start a new session amidst an active session." ) ;

    this.startTime = new Date() ;
    this.endTime = this.startTime ;
    this.effectiveDuration.set( 0 ) ;
    this.currentProblemAttempt = null ;
    this.pauses = [] ;
    this.currentPause = null ;
    this.pausesDuringCurrentProblemAttempt = [] ;

    this.sessionId = await this.networkSvc.startSession( this ) ;
    this.tickHandle = this.timerSvc.subscribe( ( tickCount) => this.sessionTick( tickCount ) ) ;
  }

  public async end() {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't end session. No active session exists." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't end session. Current session is paused." ) ;

    this.assertStates( !this.isInProblemAttemptMode() )
        .elseThrow( "Can't end session. Currently in exercise mode." ) ;

    this.endTime = new Date() ;
    this.computeEffectiveSessionDuration() ;
    await this.networkSvc.extendSession( this ) ;

    // Note that there is no server API to close the session.
    // A session end duration is taken as the end time. This insulates
    // us from client crash and leaving the session data on the server
    // in an inconsistent fashion.
    this.sessionId = -1 ;
    this.tickHandle!.unsubscribe() ;
  }

  public async pause() {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't pause session. No active session exists." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't pause session. Current session is already paused." ) ;

    let pause = new Pause( this.sessionId ) ;
    pause.id = await this.networkSvc.startPause( pause ) ;

    this.pauses.push( pause ) ;
    this.currentPause = pause ;
    if( this.currentProblemAttempt != null ){
      this.pausesDuringCurrentProblemAttempt.push( pause ) ;
    }

    this.updateContinuationTime() ;
  }

  public async resume() {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't resume session. No active session exists." ) ;

    this.assertStates( this.isPaused() )
        .elseThrow( "Can't resume session. Current session is not paused." ) ;

    this.updateContinuationTime() ;
    this.currentPause = null ;
  }

  public async startProblemAttempt( problem:TopicProblemSO ) {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't start problem attempt. No active session exists." ) ;

    this.assertStates( !this.isInProblemAttemptMode() )
        .elseThrow( "Can't start problem attempt. Already in problem attempt mode." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't start problem attempt. Current session is paused." ) ;

    const currentTime = new Date() ;
    let problemAttempt = {
      id: -1,
      sessionId: this.sessionId,
      problemId: problem.problemId,
      startTime: currentTime,
      endTime: currentTime,
      effectiveDuration: 0,
      prevState: problem.problemState,
      targetState: problem.problemState,
    } ;

    problemAttempt.id = await this.networkSvc.startProblemAttempt( problemAttempt ) ;

    this.currentProblem = problem ;
    this.problemAttempts.push( problemAttempt ) ;
    this.currentProblemAttempt = problemAttempt ;
    this.pausesDuringCurrentProblemAttempt = [] ;

    this.updateContinuationTime() ;
  }

  public async endProblemAttempt() {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't end problem attempt. No active session exists." ) ;

    this.assertStates( this.isInProblemAttemptMode() )
        .elseThrow( "Can't end problem attempt. No active problem exists." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't attempt problem attempt. Current session is paused." ) ;

    this.updateContinuationTime() ;

    this.currentProblem = null ;
    this.currentProblemAttempt = null ;
    this.pausesDuringCurrentProblemAttempt = [] ;
  }

  public updateContinuationTime( updateServer:boolean = true ) {

    const currentTime = new Date() ;

    this.endTime = currentTime ;

    if( this.currentPause != null ) {
      this.currentPause.updateEndTime( currentTime ) ;
    }

    if( this.currentProblemAttempt != null ) {

      this.currentProblemAttempt!.endTime = currentTime ;
      this.computeEffectiveProblemAttemptDuration() ;
      this.currentProblemAttemptsDuration.set( this.currentProblemAttempt!.effectiveDuration ) ;
    }

    this.computeEffectiveSessionDuration() ;

    if( updateServer ) {
      // Extend the session asynchronously.
      this.networkSvc.extendSession( this ).then() ;
    }
  }

  private computeEffectiveSessionDuration() {

    const totalDuration = ( this.endTime.getTime() - this.startTime.getTime() ) / 1000 ;
    const effDuration = totalDuration - this.getTotalPauseDuration( this.pauses ) ;

    this.effectiveDuration.set( effDuration ) ;
  }

  private computeEffectiveProblemAttemptDuration() {

    if( this.currentProblemAttempt != null ){

      const cpa = this.currentProblemAttempt ;
      const cpaPauses = this.pausesDuringCurrentProblemAttempt ;

      const totalDuration = ( cpa.endTime.getTime() - cpa.startTime.getTime() )/1000 ;
      const pauseDuration = this.getTotalPauseDuration( cpaPauses ) ;

      cpa.effectiveDuration = ( totalDuration - pauseDuration ) ;
    }
  }

  // This returns the aggregate duration of all the pauses in seconds
  private getTotalPauseDuration( pauses:Pause[] ) {
    return pauses.reduce( (total:number, pause:Pause) => {
      return total + pause.duration() ;
    }, 0 ) ;
  }
}