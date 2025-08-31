import { Component } from '@angular/core';
import { UIStateService } from "../../ui-service";

@Component({
    selector: 'periodic-table',
    templateUrl: './periodic-table.component.html',
    styleUrls: ['./periodic-table.component.css']
})
export class PeriodicTableComponent {

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Periodic Table' ) ;
    }

    ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "periodic-table" ) ;
    }
}