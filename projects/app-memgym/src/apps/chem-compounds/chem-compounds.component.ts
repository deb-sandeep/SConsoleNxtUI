import { Component, inject } from '@angular/core';
import { UIStateService } from "../../ui-service";
import { ModalDialogComponent, PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChemCompound, ChemCompoundsService } from "./chem-compounds.service";

@Component( {
    selector: 'chem-compounds-app',
    templateUrl: './chem-compounds.component.html',
    imports: [
        PageToolbarComponent,
        ToolbarActionComponent,
        ModalDialogComponent,
        ReactiveFormsModule,
        FormsModule
    ],
    styleUrls: [ './chem-compounds.component.css' ]
})
export class ChemCompoundsComponent {

    svc = inject( ChemCompoundsService ) ;

    importDialogVisible:boolean = false ;
    importQueryParams:any = {
        filterText : "",
        importType : "formula",
        forceImport : true
    } ;
    importDialogMsgs: string[] = [] ;
    importedCompound: ChemCompound ;

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Chemical Compounds' ) ;
    }

    ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "chem-compounds" ) ;
    }

    importCompound() {
        if( this.validateImportInputs() ) {
            console.log( 'Import inputs validated.' ) ;
            this.svc.importCompound( this.importQueryParams.importType,
                                     this.importQueryParams.filterText,
                                     this.importQueryParams.forceImport )
              .then( chemCompound => {
                    this.importedCompound = chemCompound ;
                    this.importDialogVisible = false ;
                    console.log( 'Compound imported' ) ;
                    console.log( chemCompound ) ;
              } )
              .catch( error => {
                  this.importDialogMsgs.push( "ERROR: " + error ) ;
              } ) ;
        }
    }

    private validateImportInputs() {
        this.importDialogMsgs = [] ;
        if( this.importQueryParams.filterText.trim().length === 0 ) {
            this.importDialogMsgs.push( 'ERROR: Filter text can\'t be empty.' ) ;
        }
        return this.importDialogMsgs.length === 0 ;
    }
}