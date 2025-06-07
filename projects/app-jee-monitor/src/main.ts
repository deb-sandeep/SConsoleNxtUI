import { CommonModule } from '@angular/common' ;
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component, inject } from '@angular/core';
import { NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";

import { pageRoutes } from "./routes" ;
import { StateService } from "./service/state.service";
import { WebSocketService } from "./service/web-socket.service";
import { RestApiService } from "./service/rest-api.service";
import { UIHelperService } from "./service/ui-helper.service";

@Component( {
  selector: 'app-root',
  imports: [
    CommonModule,
    NgbAlertModule,
    RouterOutlet
  ],
  providers: [ StateService, WebSocketService, RestApiService, UIHelperService ],
  standalone: true,
  template: `
        <div id="connection-status">
          <span class="bi-stop-circle"
                [style.color]="networkSvc.connected()?'green':'red'"></span>
        </div>
        <div id="page-content">
          <router-outlet></router-outlet>
        </div>
        <div id="footer">
          <button type="button" class="btn btn-secondary footer-btn"
                  (click)="buttonClicked('session-events')"
                  [ngClass]="isSelected( 'session-events' )">
            <span class="bi-mortarboard"></span>
          </button>
          <button type="button" class="btn btn-secondary footer-btn"
                  (click)="buttonClicked( 'dashboard' )"
                  [ngClass]="isSelected( 'dashboard' )">
            <span class="bi-speedometer2"></span>
          </button>
        </div>
    `
})
class AppComponent {

  networkSvc: WebSocketService = inject( WebSocketService ) ;
  stateSvc: StateService = inject( StateService ) ;
  router: Router = inject( Router ) ;

  private selectedBtnName = 'session-events' ;

  constructor() {}

  buttonClicked( name:string ) {
    this.selectedBtnName = name;
    switch( name ) {
      case 'session-events':
        this.router.navigateByUrl( '/session-events' ).then() ;
        break ;
      case 'dashboard':
        this.router.navigateByUrl('/dashboard' ).then() ;
        break
    }
  }

  isSelected( name:string ) {
    return name === this.selectedBtnName ? 'selected' : '' ;
  }
}

bootstrapApplication( AppComponent, {
  providers: [
    provideRouter( pageRoutes ),
    provideHttpClient( withFetch() ),
    StateService,
    WebSocketService
  ]
}).catch((err) => console.error(err)) ;
