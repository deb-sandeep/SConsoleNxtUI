import { Component } from '@angular/core';
import { UIStateService } from "../../ui-service";

@Component({
    selector: 'trend-plotter',
    templateUrl: './trend-plotter.component.html',
    styleUrls: ['./trend-plotter.component.css']
})
export class TrendPlotterComponent {

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Trend Plotter' ) ;
    }

    ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "trend-plotter" ) ;
    }
}