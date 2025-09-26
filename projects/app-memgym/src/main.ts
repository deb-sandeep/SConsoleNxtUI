import { CommonModule } from '@angular/common' ;
import { provideRouter } from '@angular/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent, FeatureMenubarComponent, } from 'lib-core';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { RapidCalcComponent } from "./apps/rapid-calc/rapid-calc.component" ;
import { PeriodicTableComponent } from "./apps/periodic-table/periodic-table.component";
import { UIStateService } from "./ui-service";
import { TrendPlotterComponent } from "./apps/trend-plotter/trend-plotter.component";
import { ChemCompoundsComponent } from "./apps/chem-compounds/chem-compounds.component";
import { ChemCompoundsService } from "./apps/chem-compounds/chem-compounds.service";
import { provideHttpClient, withFetch } from "@angular/common/http";

// app.config.ts (standalone) or app.module.ts (NgModule)
import { APP_INITIALIZER, Provider } from '@angular/core';
import { RelationsExplorerComponent } from "./apps/relations-explorer/relations-explorer.component";

const routes: Routes = [
    {
        path: '',
        title: 'Rapid Calculations',
        component: RapidCalcComponent
    },
    {
        path: 'rapid-calc',
        title: 'Rapid Calculations',
        component: RapidCalcComponent
    },
    {
        path: 'periodic-table',
        title: 'Periodic Table',
        component: PeriodicTableComponent
    },
    {
        path: 'trend-plotter',
        title: 'Trend Plotter',
        component: TrendPlotterComponent
    },
    {
        path: 'chem-compounds',
        title: 'Chemical Compounds',
        component: ChemCompoundsComponent,
        providers: [ ChemCompoundsService ]
    },
    {
        path: 'relations-explorer',
        title: 'Relations Explorer',
        component: RelationsExplorerComponent
    }
] ;

function loadMathJax() {
    return () => new Promise<void>((resolve, reject) => {
        if ((window as any).MathJax) { resolve(); return; }

        // configuration must be set before loading
        (window as any).MathJax = {
            tex: {
                inlineMath: [['\\(', '\\)'], ['$', '$']],
                displayMath: [['$$','$$']],
                packages: { '[+]': ['mhchem'] }
            },
            loader: { load: ['[tex]/mhchem'] }
        };

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
    });
}

export const MATHJAX_LOADER: Provider = {
    provide: APP_INITIALIZER,
    useFactory: loadMathJax,
    multi: true
};

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        PageHeaderComponent, FeatureMenubarComponent
    ],
    template: `
        <page-header [title]="'Memory Gym > ' + uiState.appTitle()"></page-header>
        <feature-menubar [meta]="uiState.menubarMeta"></feature-menubar>
        <div class="feature-page-body">
            <router-outlet></router-outlet>
        </div>
    `
})
class AppComponent {
    constructor( public uiState: UIStateService ) {}
}

bootstrapApplication( AppComponent, {
    providers: [ provideRouter(routes),
                 provideHttpClient( withFetch() ),
                 MATHJAX_LOADER ]
}).catch((err) => console.error(err)) ;
