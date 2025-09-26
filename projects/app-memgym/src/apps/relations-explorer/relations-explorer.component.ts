import { Component } from '@angular/core';
import { UIStateService } from "../../ui-service";

@Component({
    selector: 'relations-explorer',
    templateUrl: './relations-explorer.component.html',
    styleUrls: ['./relations-explorer.component.css']
})
export class RelationsExplorerComponent {

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Relations Explorer' ) ;
    }

    ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "relations-explorer" ) ;
    }
}