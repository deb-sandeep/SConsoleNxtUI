import {
  SessionTypeSO,
  SyllabusSO,
  TopicProblemSO,
  TopicSO
} from "@jee-common/util/master-data-types";
import { TagSO } from "@jee-common/util/tag-data-types";
import { inject, signal } from "@angular/core";
import { SessionNetworkService } from "../service/session-network.service";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/util/storage-keys";
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
  private sessionExtensionInProgress = false ;

  sessionType:SessionTypeSO|null = null ;
  syllabus = signal<SyllabusSO|null>(null);
  topic = signal<TopicSO|null>(null) ;
  problems: TopicProblemSO[] = [] ;
  pigeonProblems: TopicProblemSO[] = [] ;
  activeProblems: TopicProblemSO[] = [] ;

  // The derived array `problems` points to while a tag filter is active.
  filteredProblems: TopicProblemSO[] | null = null ;
  // True origin (activeProblems or pigeonProblems) that `problems` aliased
  // before any filter was applied - captured once, on the first filter
  // apply, so a later reset always restores the whole remaining source.
  private filterSourceProblems: TopicProblemSO[] | null = null ;

  sessionId:number = -1 ; // <=0 => session not started

  problemAttempts:ProblemAttempt[] = [] ;

  currentPause: Pause|null = null ;
  currentProblemAttempt:ProblemAttempt|null = null ;

  audioClip: HTMLAudioElement|null = null ;

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

  public hasPigeons() {
    return this.pigeonProblems.length > 0 ;
  }

  public hasActiveProblems() {
    return this.activeProblems.length > 0 ;
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

  public async fetchProblems() {
    [ this.pigeonProblems, this.activeProblems ] = await Promise.all( [
      this.networkSvc.getPigeonsForSession( this ),
      this.networkSvc.getActiveProblemsForSession( this ),
    ] ) ;
  }

  public selectPigeonProblems() {
    if( this.filterSourceProblems === this.pigeonProblems && this.filteredProblems !== null ) {
      this.problems = this.filteredProblems ;
    }
    else {
      this.problems = this.pigeonProblems ;
      this.filterSourceProblems = null ;
      this.filteredProblems = null ;
    }
  }

  public selectActiveProblems() {
    if( this.filterSourceProblems === this.activeProblems && this.filteredProblems !== null ) {
      this.problems = this.filteredProblems ;
    }
    else {
      this.problems = this.activeProblems ;
      this.filterSourceProblems = null ;
      this.filteredProblems = null ;
    }
  }

  public isFilterActive() {
    return this.filterSourceProblems !== null ;
  }

  // Narrows `problems` (the currently displayed set) down to problems
  // carrying at least one of selectedTagIds. Re-applying narrows further
  // (compounds), since it always filters the current `problems`, not the
  // original source.
  public applyProblemTagFilter( selectedTagIds: Set<number>,
                                tagsByProblemId: Record<number, TagSO[]> ) {

    if( this.filterSourceProblems === null ) {
      this.filterSourceProblems = this.problems ;
    }

    const filtered = this.problems.filter( p => {
      const tags = tagsByProblemId[ p.problemId ] ?? [] ;
      return tags.some( t => selectedTagIds.has( t.id ) ) ;
    } ) ;

    this.filteredProblems = filtered ;
    this.problems = filtered ;
  }

  // Drops every filter applied so far, restoring the completion-adjusted
  // source array (activeProblems or pigeonProblems).
  public resetProblemFilter() {
    if( this.filterSourceProblems !== null ) {
      this.problems = this.filterSourceProblems ;
    }
    this.filterSourceProblems = null ;
    this.filteredProblems = null ;
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
    await this.networkSvc.endPause( this.currentPause! ) ;
    this.currentPause = null ;
  }

  public async startProblemAttempt( problem:TopicProblemSO ) {

    this.assertStates( this.isActive() )
        .elseThrow( "Can't start problem attempt. No active session exists." ) ;

    this.assertStates( !this.isInProblemAttemptMode() )
        .elseThrow( "Can't start problem attempt. Already in problem attempt mode." ) ;

    this.assertStates( !this.isPaused() )
        .elseThrow( "Can't start problem attempt. Current session is paused." ) ;

    let problemAttempt = new ProblemAttempt( problem, this ) ;
    let response = await this.networkSvc.startProblemAttempt( problemAttempt ) ;

    problemAttempt.id = response.problemAttemptId ;
    problemAttempt.baseTotalDuration = response.totalDuration ;

    this.currentProblemAttempt = problemAttempt ;
    this.problemAttempts.push( problemAttempt ) ;

    this.updateContinuationTime() ;

    if( this.audioClip == null ) {
      this.audioClip = new Audio() ;
      this.audioClip.autoplay = true ;
      this.audioClip.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    }
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

    const problemId = this.currentProblemAttempt!.problem.problemId ;
    let index = this.problems.findIndex( value => value.problemId === problemId ) ;
    let nextProblemIndex = index + 1 ;

    // filterSourceProblems, when set, is the true origin array - use that
    // (rather than `problems`, which may currently be a filtered derivative)
    // to decide whether we're working the pigeon list.
    const workingSource = this.filterSourceProblems ?? this.problems ;
    const workingPigeons = workingSource === this.pigeonProblems ;

    if( workingPigeons && targetState === 'Redo' ) {
      this.removeProblemFromWorkingSets( problemId ) ;
      nextProblemIndex = index ;
    }
    else if( workingPigeons && targetState === 'Pigeon' ) {
      // Don't do anything. Let the problem be there in this context
    }
    else if ( !['Later','Redo'].includes( targetState ) ) {
      this.removeProblemFromWorkingSets( problemId ) ;
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

  // Removes problemId from `problems` (the currently displayed set) and,
  // if a tag filter is active, also from filterSourceProblems - the true
  // origin array - so a later reset never resurrects a completed problem.
  private removeProblemFromWorkingSets( problemId: number ) {

    const idx = this.problems.findIndex( p => p.problemId === problemId ) ;
    if( idx !== -1 ) {
      this.problems.splice( idx, 1 ) ;
    }

    if( this.filterSourceProblems !== null ) {
      const srcIdx = this.filterSourceProblems.findIndex( p => p.problemId === problemId ) ;
      if( srcIdx !== -1 ) {
        this.filterSourceProblems.splice( srcIdx, 1 ) ;
      }
    }
  }

  private updateContinuationTime( updateServer:boolean = true ) {

    const currentTime = new Date() ;

    this.currentPause?.updateEndTime( currentTime ) ;
    this.currentProblemAttempt?.updateEndTime( currentTime ) ;

    this.updateEndTime( currentTime ) ;

    if( updateServer ) {
      if( !this.sessionExtensionInProgress ) {
        // Extend the session asynchronously.
        this.sessionExtensionInProgress = true ;
        this.networkSvc.extendSession( this ).then( ()=> this.sessionExtensionInProgress = false ) ;
      }
      else {
        console.log( 'Session extension on server in progress. Ignoring duplicate request.' ) ;
      }
    }
  }

  public playBellSound() {
    this.audioClip!.src = 'audio/bell.mp3' ;
  }

  public playDoubleBellSound() {
    this.audioClip!.src = 'audio/double-bell.mp3' ;
  }

  public playTripleBellSound() {
    this.audioClip!.src = 'audio/triple-bell.mp3' ;
  }
}