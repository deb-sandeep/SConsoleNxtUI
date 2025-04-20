import { CommonModule } from '@angular/common' ;
import { provideRouter } from '@angular/router';
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
    title: string = 'JEE Preparation > Master Data Management' ;
    menubarMeta : FeatureMenuItemMeta[] = [
        { routePath:'/manage-books', iconName:'journals', selected:false },
        { routePath:'/manage-problems', iconName:'p-square', selected:false },
        { routePath:'/manage-tracks', iconName:'bar-chart-steps', selected:false },
        { routePath:'/solve-pigeons', iconName:'twitter', selected:true },
        { routePath:'/problem-history', iconName:'clock-history', selected:false },
    ] ;

    constructor( alertConfig:NgbAlertConfig ) {
        alertConfig.type = 'danger' ;
    }
}

bootstrapApplication( AppComponent, {
    providers: [
        provideRouter( featureRoutes ),
        provideHttpClient( withFetch() )
    ]
}).catch((err) => console.error(err)) ;
