import { CommonModule } from '@angular/common' ;
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http'
import { Component } from '@angular/core';
import { NgbAlertConfig, NgbAlertModule } from "@ng-bootstrap/ng-bootstrap";
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {PageHeaderComponent, FeatureMenubarComponent, FeatureMenuItemMeta, ModalWaitComponent} from 'lib-core';

import { featureRoutes } from "./routes" ;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet, RouterLink, RouterLinkActive,
        PageHeaderComponent, FeatureMenubarComponent,
        NgbAlertModule, ModalWaitComponent,
    ],
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
        { routePath:'/manage-books', iconName:'journals', selected:true },
        { routePath:'/manage-problems', iconName:'p-square', selected:false },
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
