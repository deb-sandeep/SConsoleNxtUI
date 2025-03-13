import { inject, Injectable, signal } from '@angular/core';

import { RemoteCtrlMsg } from "./web-socket.service";
import { Router } from "@angular/router";

@Injectable()
export class StateService {

  readonly screenRoutes: Record<string, string> = {} ;

  router: Router = inject( Router ) ;

  currentScreenId: string | null = null ;
  currentScreenName: string | null = null ;
  possibleNextScreens: string[] = [] ;
  currentRoute: string | null = null ;

  remainingScreenTime = signal<number>(0) ;

  processRemoteCtrlMsg( ctrlMsg: RemoteCtrlMsg ) {
    if( ctrlMsg.messageType === "SHOW_SCREEN" ) {
      this.changeScreen( ctrlMsg ) ;
    }
    else if( ctrlMsg.messageType === "LIFESPAN_COUNTER" ) {
      this.remainingScreenTime.set( ctrlMsg.remainingLifespan ) ;
    }
  }

  private changeScreen( ctrlMsg: RemoteCtrlMsg ) {

    this.currentScreenId = ctrlMsg.screenId ;
    this.currentScreenName = ctrlMsg.screenName ;
    this.possibleNextScreens = ctrlMsg.possibleNextScreens ;

    let targetRoute = "launchpad" ;
    if( this.currentScreenId in this.screenRoutes ) {
      targetRoute = this.screenRoutes[this.currentScreenId] ;
    }

    if( this.currentRoute == null || this.currentRoute !== targetRoute ) {
      this.router.navigateByUrl( targetRoute ).then( r => {
        this.currentRoute = targetRoute ;
      }) ;
    }
  }
}