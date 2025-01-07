import { CommonModule } from '@angular/common' ;
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PageHeaderComponent, FeatureMenubarComponent, FeatureMenuItemMeta } from 'lib-core';

import { ManageBooksComponent } from "./features/manage-books/manage-books.component";

const routes: Routes = [
    {
        path: '',
        title: 'Manage Books',
        component: ManageBooksComponent
    },
    {
        path: 'manage-books',
        title: 'Manage Books',
        component: ManageBooksComponent
    },
] ;

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet, RouterLink, RouterLinkActive,
        PageHeaderComponent, FeatureMenubarComponent
    ],
    template: `
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
        { iconName:'journals',  routePath:'/manage-books', selected:true },
    ] ;
}

bootstrapApplication( AppComponent, {
    providers: [provideRouter(routes)]
}).catch((err) => console.error(err)) ;
