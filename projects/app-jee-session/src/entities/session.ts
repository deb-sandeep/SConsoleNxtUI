import {
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicSO
} from "@jee-common/master-data-types";
import { inject, signal } from "@angular/core";
import { SessionNetworkService } from "../service/session-network.service";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/storage-keys";
import { TimerService } from "../service/timer.service";
import { Subscription } from "rxjs" ;
import { Pause } from "./pause";
import { ProblemAttempt } from "./problem-attempt";
import { PausableTimedEntity } from "./base-entities";

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

export class Session extends PausableTimedEntity {

  private timerSvc:TimerService = inject( TimerService ) ;
  private tickHandle:Subscription | null = null ;

  private networkSvc: SessionNetworkService = inject( SessionNetworkService ) ;
  private localStorageSvc: LocalStorageService = inject( LocalStorageService ) ;

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;
  problems: TopicProblemSO[] = [] ;

  sessionId:number = -1 ; // <=0 => session not started

  problemAttempts:ProblemAttempt[] = [] ;

  currentPause: Pause|null = null ;
  currentProblemAttempt:ProblemAttempt|null = null ;

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

  public async fetchActiveProblems() {
    this.problems = await this.networkSvc.getActiveProblemsForSession( this ) ;
  }

  // ------------- Timer callback -------------------------------------------------
  private sessionTick( tickCount:number ) {
    this.updateContinuationTime( tickCount%5 == 0 ) ;
  }

  // -------------- Session operations --------------------------------------------
  public async start() {

    this.assertStates( this.isInactive() )
        .elseThrow( "Can't start a new session amidst an active session." ) ;

    this.startTime = new Date() ;
    this.endTime = this.startTime ;
    this.effectiveDuration.set( 0 ) ;
    this.currentProblemAttempt = null ;
    this.pauses = [] ;
    this.currentPause = null ;

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

    this.updateEndTime( new Date() ) ;
    await this.networkSvc.extendSession( this ) ;
    await this.networkSvc.endSession( this ) ;

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
      this.currentProblemAttempt.addPause( pause ) ;
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

    let problemAttempt = new ProblemAttempt( this.sessionId, problem ) ;
    problemAttempt.id = await this.networkSvc.startProblemAttempt( problemAttempt ) ;

    this.currentProblemAttempt = problemAttempt ;
    this.problemAttempts.push( problemAttempt ) ;

    this.updateContinuationTime() ;
  }

  public async endProblemAttempt( targetState:string ) {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't end problem attempt. No active session exists." ) ;

    this.assertStates( this.isInProblemAttemptMode() )
        .elseThrow( "Can't end problem attempt. No active problem exists." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't attempt problem attempt. Current session is paused." ) ;

    this.currentProblemAttempt!.targetState = targetState ;
    await this.networkSvc.endProblemAttempt( this.currentProblemAttempt! ) ;

    this.updateContinuationTime() ;

    let index = this.problems.findIndex( value =>
      value.problemId === this.currentProblemAttempt!.problem.problemId ) ;
    let nextProblemIndex = index + 1 ;

    if ( !['Later','Redo'].includes( targetState ) ) {
      this.problems.splice( index, 1 ) ;
      nextProblemIndex = index ;
    }
    else {
      this.currentProblemAttempt!.problem.problemState = targetState ;
    }

    this.currentProblemAttempt = null ;

    if( nextProblemIndex < this.problems.length ) {
      return this.problems[ nextProblemIndex ] ;
    }
    return ;
  }

  private updateContinuationTime( updateServer:boolean = true ) {

    const currentTime = new Date() ;

    this.currentPause?.updateEndTime( currentTime ) ;
    this.currentProblemAttempt?.updateEndTime( currentTime ) ;

    this.updateEndTime( currentTime ) ;

    if( updateServer ) {
      // Extend the session asynchronously.
      this.networkSvc.extendSession( this ).then() ;
    }
  }
}