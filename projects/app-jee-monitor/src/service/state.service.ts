import { Injectable } from '@angular/core';

import {
  PauseEnd,
  PauseStart,
  ProblemAttemptEnd,
  ProblemAttemptStart,
  SessionEnd, SessionExtended,
  SessionStart
} from "./response-payload.types";
import {
  Pause,
  ProblemAttempt,
  Session
} from "../screens/session-events-screen/session-event.entities";

@Injectable()
export class StateService {

  sessions: Session[] = [] ;

  private currentSession: Session | null = null ;
  private currentProblemAttempt: ProblemAttempt | null = null ;
  private currentPause: Pause | null = null ;

  clearState() {
    this.currentSession = null;
    this.currentProblemAttempt = null;
    this.currentPause = null;
    this.sessions = [] ;
  }

  processSessionStartEvent( event: SessionStart ) {
    if( this.currentSession != null ) {
      console.log( "Session start event encountered while a session is in progress." ) ;
      console.log( event ) ;
    }
    else {
      let session = new Session( event ) ;
      this.sessions.unshift( session ) ;
      this.currentSession = session ;
    }
  }

  processSessionEndEvent( event: SessionEnd ) {
    if( this.currentSession == null ) {
      console.log( "Session end event received without a live session." ) ;
      console.log( event ) ;
    }
    else {
      this.currentSession.processEndEvent( event ) ;
      this.currentSession = null ;
    }
  }

  processProblemAttemptStartEvent( event: ProblemAttemptStart ) {
    if( this.currentSession == null ) {
      console.log( "Problem attempt start event received without a live session." ) ;
      console.log( event ) ;
    }
    else {
      if( this.currentProblemAttempt != null ) {
        console.log( "Problem attempt start event received while a problem attempt is in progress." ) ;
        console.log( event ) ;
      }
      else {
        if( event.sessionId == this.currentSession.sessionId ) {
          let pa = new ProblemAttempt( event ) ;
          this.currentSession.addProblemAttempt( pa ) ;
          this.currentProblemAttempt = pa ;
        }
      }
    }
  }

  processProblemAttemptEndEvent( event: ProblemAttemptEnd ) {
    if( this.currentSession == null ) {
      console.log( "Problem attempt end event received without a live session." ) ;
      console.log( event ) ;
    }
    else {
      if( this.currentProblemAttempt == null ) {
        console.log( "Problem attempt end event received without a problem attempt is in progress." ) ;
        console.log( event ) ;
      }
      else {
        if( event.sessionId == this.currentSession.sessionId ) {
          this.currentProblemAttempt.processEndEvent( event ) ;
          this.currentProblemAttempt = null ;
        }
      }
    }
  }

  processPauseStartEvent( event: PauseStart ) {
    if( this.currentSession == null ) {
      console.log( "Pause start event received without a live session." ) ;
      console.log( event ) ;
    }
    else {
      let pause = new Pause( event ) ;
      this.currentPause = pause ;
      if( this.currentProblemAttempt != null ) {
        this.currentProblemAttempt.addPause( pause ) ;
      }
      else {
        this.currentSession.addPause( pause ) ;
      }
    }
  }

  processPauseEndEvent( event: PauseEnd ) {
    if( this.currentSession == null ) {
      console.log( "Pause end end event received without a live session." ) ;
      console.log( event ) ;
    }
    else {
      this.currentPause?.processEndEvent( event ) ;
      this.currentPause = null ;
    }
  }

  processSessionExtendedEvent( sessionExt: SessionExtended ) {
    if( this.currentSession == null ) {
      console.log( "Session extended event received without a live session." ) ;
    }
    else {
      this.currentSession.effectiveDuration = sessionExt.sessionEffectiveDuration ;
      if( this.currentProblemAttempt != null ) {
        this.currentProblemAttempt.effectiveDuration = sessionExt.problemAttemptEffectiveDuration ;
      }

      if( this.currentPause != null ) {
        this.currentPause.duration = sessionExt.pauseDuration ;
      }
    }
  }
}