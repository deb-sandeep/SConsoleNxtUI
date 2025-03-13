import { inject, Injectable, OnDestroy } from '@angular/core';
import { RxStomp, RxStompConfig } from "@stomp/rx-stomp";

import { environment } from "@env/environment" ;
import { StateService } from "./state.service";

export type RemoteCtrlMsg = {
  messageType: string,
  screenId: string,
  screenName: string,
  possibleNextScreens: string[],
  remainingLifespan: number,
}

@Injectable()
export class WebSocketService extends RxStomp implements OnDestroy {

  stateSvc: StateService = inject( StateService ) ;

  constructor() {
    console.log( 'Creating webSocket service...' );
    super();
    super.configure( {
      brokerURL: `${environment.wsRoot}/app-remote-websocket`,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 10000,
      reconnectDelay: 1000,
    } as RxStompConfig ) ;
    super.activate() ;

    super.publish( { destination: '/app-remote/currentScreen' } ) ;
    super.watch( '/topic/remote-screen-messages' )
      .subscribe( (message:any) => {
        let ctrlMsg = JSON.parse( message.body ) as RemoteCtrlMsg ;
        this.stateSvc.processRemoteCtrlMsg( ctrlMsg ) ;
    }) ;
  }

  ngOnDestroy(): void {
    super.deactivate().then() ;
  }

  showScreen( targetScreenId: string ) {
    super.publish( {
      destination: '/app-remote/showScreen',
      body: targetScreenId
    } ) ;
  }
}