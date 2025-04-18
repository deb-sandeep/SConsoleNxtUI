import { CommonModule } from '@angular/common' ;
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent, FeatureMenubarComponent, FeatureMenuItemMeta } from 'lib-core';

import { NewTestComponent } from "./features/new-test/new-test.component" ;
import { TestHistoryComponent } from "./features/test-history/test-history.component" ;

const routes: Routes = [
    {
        path: '',
        title: 'New Test',
        component: NewTestComponent
    },
    {
        path: 'new-test',
        title: 'New Test',
        component: NewTestComponent
    },
    {
        path: 'test-history',
        title: 'Test History',
        component: TestHistoryComponent
    }
] ;

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
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
    title: string = 'Memory Gym > Speed Arithmetic' ;
    menubarMeta : FeatureMenuItemMeta[] = [
        { iconName:'plus-circle',  routePath:'/new-test', selected:true },
        { iconName:'clock-history',  routePath:'/test-history', selected:false },
    ] ;
}

bootstrapApplication( AppComponent, {
    providers: [provideRouter(routes)]
}).catch((err) => console.error(err)) ;
