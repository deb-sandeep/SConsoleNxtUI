import { CommonModule } from '@angular/common' ;
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component } from '@angular/core';
import { NgbAlertConfig, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent, ModalWaitComponent, Alert, AlertsDisplayComponent } from 'lib-core';

import { pageRoutes } from "./routes" ;
import AlertService = Alert.AlertService;

@Component( {
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    PageHeaderComponent,
    NgbAlertModule, ModalWaitComponent, AlertsDisplayComponent,
  ],
  standalone: true,
  template: `
        <modal-wait></modal-wait>
        <page-header [title]="title"></page-header>
        <alerts-display></alerts-display>
        <div id="page-content">
            <router-outlet></router-outlet>
        </div>
    `
})
class AppComponent {
  title: string = 'JEE > Study Session' ;

  constructor( alertConfig:NgbAlertConfig ) {
    alertConfig.type = 'danger' ;
  }
}

bootstrapApplication( AppComponent, {
  providers: [
    provideRouter( pageRoutes ),
    provideHttpClient( withFetch() ),
    AlertService
  ]
}).catch((err) => console.error(err)) ;
