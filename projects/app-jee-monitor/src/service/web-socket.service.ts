import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { RxStomp, RxStompConfig } from "@stomp/rx-stomp";
import { NgZone } from "@angular/core";

import { environment } from "@env/environment" ;
import { StateService } from "./state.service";
import {
  DashboardState,
  PauseEnd,
  PauseStart,
  ProblemAttemptEnd,
  ProblemAttemptStart,
  SessionEnd,
  SessionEvent, SessionExtended,
  SessionStart,
  TopicDetailState
} from "./response-payload.types";

export type AppMonitorResponse = {
  responseType: string,
  payload: any
}

@Injectable()
export class WebSocketService extends RxStomp implements OnDestroy {

  stateSvc: StateService = inject( StateService ) ;

  // Flips true on every websocket send/receive, then auto-resets, so the
  // connection-status icon can flicker to show live channel activity.
  activity: WritableSignal<boolean> = signal( false ) ;
  private activityResetTimer: ReturnType<typeof setTimeout> | undefined ;

  constructor( private ngZone: NgZone ) {
    console.log( 'Creating webSocket service...' );
    super();
    super.configure( {
      brokerURL: `${environment.wsRoot}/app-monitor-websocket`,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 1000,
    } as RxStompConfig ) ;
    super.activate() ;

    // Fires on initial connect AND every subsequent reconnect, so a fresh
    // snapshot (and full state rebuild via DAY_SESSION_EVENTS) is requested
    // after any connectivity gap, not just once at startup.
    this.connected$.subscribe( () => {
      this.pulseActivity() ;
      super.publish( { destination: '/app-monitor/todaySessionEvents' } ) ;
    } ) ;

    super.watch( '/topic/app-monitor-responses' )
         .subscribe( ( message:any ) => {
           let res = JSON.parse( message.body ) as AppMonitorResponse ;
           this.ngZone.run( () => {
             this.pulseActivity() ;
             this.processMonitorResponse( res ) ;
           })
         }) ;
  }

  // connected$ emissions and outgoing publish() calls can originate outside
  // the Angular zone, so pulseActivity always re-enters the zone itself
  // rather than relying on callers to do so.
  private pulseActivity() {
    this.ngZone.run( () => {
      this.activity.set( true ) ;
      clearTimeout( this.activityResetTimer ) ;
      this.activityResetTimer = setTimeout( () => this.activity.set( false ), 400 ) ;
    } ) ;
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

      case "CURRENT_DASHBOARD_STATE":
        const state = res.payload as DashboardState ;
        this.stateSvc.updateDashboardState( state ) ;
        break ;

      case "TOPIC_DETAIL_STATE":
        const detail = res.payload as TopicDetailState ;
        this.stateSvc.updateTopicDetailState( detail ) ;
        break ;
    }
  }

  requestTopicDetails( topicId: number ) {
    this.pulseActivity() ;
    super.publish( {
      destination: '/app-monitor/topicDetails',
      body: String( topicId ),
    } ) ;
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