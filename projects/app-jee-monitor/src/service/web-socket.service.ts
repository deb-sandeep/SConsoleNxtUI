import { inject, Injectable, OnDestroy } from '@angular/core';
import { RxStomp, RxStompConfig } from "@stomp/rx-stomp";
import { NgZone } from "@angular/core";

import { environment } from "@env/environment" ;
import { StateService } from "./state.service";
import {
  PauseEnd,
  PauseStart,
  ProblemAttemptEnd,
  ProblemAttemptStart,
  SessionEnd,
  SessionEvent, SessionExtended,
  SessionStart
} from "./response-payload.types";

export type AppMonitorResponse = {
  responseType: string,
  payload: any
}

@Injectable()
export class WebSocketService extends RxStomp implements OnDestroy {

  stateSvc: StateService = inject( StateService ) ;

  constructor( private ngZone: NgZone ) {
    console.log( 'Creating webSocket service...' );
    super();
    super.configure( {
      brokerURL: `${environment.wsRoot}/app-monitor-websocket`,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
      reconnectDelay: 1000,
    } as RxStompConfig ) ;
    super.activate() ;

    super.publish( { destination: '/app-monitor/todaySessionEvents' } ) ;

    super.watch( '/topic/app-monitor-responses' )
         .subscribe( ( message:any ) => {
           let res = JSON.parse( message.body ) as AppMonitorResponse ;
           this.ngZone.run( () => {
             this.processMonitorResponse( res ) ;
           })
         }) ;
  }

  private processMonitorResponse( res: AppMonitorResponse ) {

    console.log( "Processing websocket message..." ) ;
    console.log( res ) ;

    switch( res.responseType ) {
      case "DAY_SESSION_EVENTS":
        this.stateSvc.clearState() ;
        const events = res.payload as SessionEvent[];
        events.forEach( event => this.processSessionEvent( event ) ) ;
        break ;

      case "SESSION_EVENT":
        const event = res.payload as SessionEvent ;
        this.processSessionEvent( event ) ;
        break ;
    }
  }

  private processSessionEvent( evt: SessionEvent ) {

    switch( evt.eventType ) {
      case "SESSION_STARTED":
        this.stateSvc.processSessionStartEvent( evt.payload as SessionStart ) ;
        break ;

      case "SESSION_ENDED":
        this.stateSvc.processSessionEndEvent( evt.payload as SessionEnd ) ;
        break ;

      case "PROBLEM_ATTEMPT_STARTED":
        this.stateSvc.processProblemAttemptStartEvent( evt.payload as ProblemAttemptStart ) ;
        break ;

      case "PROBLEM_ATTEMPT_ENDED":
        this.stateSvc.processProblemAttemptEndEvent( evt.payload as ProblemAttemptEnd ) ;
        break ;

      case "PAUSE_STARTED":
        this.stateSvc.processPauseStartEvent( evt.payload as PauseStart ) ;
        break ;

      case "PAUSE_ENDED":
        this.stateSvc.processPauseEndEvent( evt.payload as PauseEnd ) ;
        break ;

      case "SESSION_EXTENDED":
        this.stateSvc.processSessionExtendedEvent( evt.payload as SessionExtended ) ;
        break ;
    }
  }

  ngOnDestroy(): void {
    super.deactivate().then() ;
  }
}