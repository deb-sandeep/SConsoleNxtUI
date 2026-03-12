import { CommonModule } from '@angular/common' ;
import { provideRouter, withRouterConfig } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component } from '@angular/core';
import { NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterOutlet } from '@angular/router';
import { ModalWaitComponent } from 'lib-core';

import { featureRoutes } from "./routes" ;

@Component( {
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        NgbAlertModule, ModalWaitComponent,
    ],
    standalone: true,
    template: `
        <modal-wait></modal-wait>
        <router-outlet></router-outlet>
    `
})
class AppComponent {
}

bootstrapApplication( AppComponent, {
    providers: [
        provideRouter(
          featureRoutes,
          withRouterConfig( {
              onSameUrlNavigation: 'reload'
          })
        ),
        provideHttpClient( withFetch() )
    ]
}).catch((err) => console.error(err)) ;
