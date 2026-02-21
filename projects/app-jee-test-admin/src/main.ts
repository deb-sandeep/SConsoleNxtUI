import { CommonModule } from '@angular/common' ;
import { provideRouter, withRouterConfig } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component } from '@angular/core';
import { NgbAlertConfig, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent, FeatureMenubarComponent, FeatureMenuItemMeta, ModalWaitComponent } from 'lib-core';

import { featureRoutes } from "./routes" ;

@Component( {
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        PageHeaderComponent, FeatureMenubarComponent,
        NgbAlertModule, ModalWaitComponent,
    ],
    standalone: true,
    template: `
        <modal-wait></modal-wait>
        <page-header [title]="title"></page-header>
        <feature-menubar [meta]="menubarMeta"></feature-menubar>
        <div class="feature-page-body">
            <router-outlet></router-outlet>
        </div>
    `
})
class AppComponent {
    title: string = 'JEE Preparation > Test Administration' ;
    menubarMeta : FeatureMenuItemMeta[] = [
        { routePath:'/question-repo', iconName:'database-gear', selected:true },
        { routePath:'/question-browser', iconName:'browser-chrome', selected:false },
        { routePath:'/exam-config', iconName:'gear-wide-connected', selected:false },
    ] ;

    constructor( alertConfig:NgbAlertConfig ) {
        alertConfig.type = 'danger' ;
    }
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
