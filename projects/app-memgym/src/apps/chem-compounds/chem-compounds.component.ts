import { Component, inject } from '@angular/core';
import { UIStateService } from "../../ui-service";
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChemCompoundsService } from "./chem-compounds.service";
import { MathjaxDirective } from "../../directives/mathjax-directive";
import { ChemCompound } from "./chem-compounds.entity";
import { ImportDialogComponent } from "./import-dialog/import-dialog.component";
import { EditDialogComponent } from "./edit-dialog/edit-dialog.component";

@Component( {
    selector: 'chem-compounds-app',
    templateUrl: './chem-compounds.component.html',
    imports: [
        PageToolbarComponent,
        ToolbarActionComponent,
        ReactiveFormsModule,
        FormsModule,
        MathjaxDirective,
        ImportDialogComponent,
        EditDialogComponent
    ],
    styleUrls: [ './chem-compounds.component.css' ]
})
export class ChemCompoundsComponent {

    svc = inject( ChemCompoundsService ) ;

    allCompounds: ChemCompound[] ;

    importDialogVisible:boolean = false ;

    editableCompound: ChemCompound | null = null ;

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Chemical Compounds' ) ;
    }

    async ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "chem-compounds" ) ;
        this.allCompounds = await this.svc.getAllCompounds() ;
    }

    showEditDialog( c:ChemCompound ) {
        this.editableCompound = c ;
    }

    handleImportedCompound( compound: ChemCompound ) {
        this.allCompounds.push( compound )
        this.allCompounds.sort( (c1, c2) => {
            return c1.commonName.localeCompare(c2.commonName);
        });
        this.importDialogVisible = false ;
        this.editableCompound = compound ;
    }
}