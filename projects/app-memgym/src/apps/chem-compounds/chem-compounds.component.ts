import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { UIStateService } from "../../ui-service";
import { ModalDialogComponent, PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChemCompound, ChemCompoundsService } from "./chem-compounds.service";
import { MathjaxDirective } from "../../directives/mathjax-directive";

@Component( {
    selector: 'chem-compounds-app',
    templateUrl: './chem-compounds.component.html',
    imports: [
        PageToolbarComponent,
        ToolbarActionComponent,
        ModalDialogComponent,
        ReactiveFormsModule,
        FormsModule,
        MathjaxDirective
    ],
    styleUrls: [ './chem-compounds.component.css' ]
})
export class ChemCompoundsComponent {

    svc = inject( ChemCompoundsService ) ;

    allCompounds: ChemCompound[] ;

    importDialogVisible:boolean = false ;
    importQueryParams:any = {
        filterText : "",
        importType : "formula",
        forceImport : true
    } ;
    importDialogMsgs: string[] = [] ;

    editDialogVisible: boolean = false ;
    editDialogMsgs: string[] = [] ;
    editableCompound: ChemCompound | null = null ;

    constructor( private uiState: UIStateService ) {
        this.uiState.setAppTitle( 'Chemical Compounds' ) ;
    }

    async ngAfterViewInit() {
        this.uiState.highlightMenuBarIcon( "chem-compounds" ) ;
        this.allCompounds = await this.svc.getAllCompounds() ;
    }

    importCompound() {
        if( this.validateImportInputs() ) {
            console.log( 'Import inputs validated.' ) ;
            this.svc.importCompound( this.importQueryParams.importType,
                                     this.importQueryParams.filterText,
                                     this.importQueryParams.forceImport )
              .then( chemCompound => {
                    this.allCompounds.push( chemCompound )
                    this.allCompounds.sort( (c1, c2) => {
                        return c1.commonName.localeCompare(c2.commonName);
                    });
                    this.importDialogVisible = false ;

                    this.editableCompound = chemCompound ;
                    this.editDialogVisible = true ;

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
    
    showEditDialog( c:ChemCompound ) {
        this.editableCompound = c ;
        this.editDialogVisible = true ;
    }

    saveEditedCompound() {
        console.log( this.editableCompound ) ;
        this.editDialogVisible = false ;
        this.editableCompound = null ;
    }
}