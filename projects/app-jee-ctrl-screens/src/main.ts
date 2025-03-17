import { CommonModule } from '@angular/common' ;
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component, inject } from '@angular/core';
import { NgbAlertConfig, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterOutlet } from '@angular/router';
import { ModalWaitComponent, Alert, AlertsDisplayComponent, PageHeaderComponent } from 'lib-core';

import { pageRoutes } from "./routes" ;
import AlertService = Alert.AlertService;
import { StateService } from "./service/state.service";
import { WebSocketService } from "./service/web-socket.service";

@Component( {
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NgbAlertModule, ModalWaitComponent, AlertsDisplayComponent, PageHeaderComponent,
  ],
  standalone: true,
  template: `
        <page-header [title]="stateSvc.currentScreenName ?? '' "
                     [farRightTitle]="getFarRightTitle()"></page-header>
        
        <modal-wait></modal-wait>
        <alerts-display></alerts-display>
        <div id="page-content">
            <router-outlet></router-outlet>
        </div>
        <div id="connection-status">
          <span class="bi-stop-circle"
                [style.color]="networkSvc.connected()?'green':'red'"></span>
        </div>
    `
})
class AppComponent {
  title: string = 'SConsole > Screens' ;

  networkSvc: WebSocketService = inject( WebSocketService ) ;
  stateSvc: StateService = inject( StateService ) ;

  constructor( alertConfig:NgbAlertConfig ) {
    alertConfig.type = 'danger' ;
  }

  getFarRightTitle(){
    let screenTimeLeft = this.stateSvc.remainingScreenTime() ;
    if( screenTimeLeft > 0 ) {
      return `${screenTimeLeft}` ;
    }
    return '' ;
  }
}

bootstrapApplication( AppComponent, {
  providers: [
    provideRouter( pageRoutes ),
    provideHttpClient( withFetch() ),
    AlertService,
    StateService,
    WebSocketService
  ]
}).catch((err) => console.error(err)) ;
