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
                 provideHttpClient( withFetch() ) ]
}).catch((err) => console.error(err)) ;
