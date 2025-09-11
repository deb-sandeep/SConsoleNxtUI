import { Component, inject } from '@angular/core';
import { UIStateService } from "../../ui-service";
import { PageToolbarComponent, ToolbarActionComponent } from "lib-core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChemCompoundsService } from "./chem-compounds.service";
import { MathjaxDirective } from "../../directives/mathjax-directive";
import { ChemCompound } from "./chem-compounds.entity";
import { ImportDialogComponent } from "./import-dialog/import-dialog.component";
import { EditDialogComponent } from "./edit-dialog/edit-dialog.component";
import { MolViewerComponent } from "./mol-viewer/mol-viewer.component";

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
        EditDialogComponent,
        MolViewerComponent
    ],
    styleUrls: [ './chem-compounds.component.css' ]
})
export class ChemCompoundsComponent {

    svc = inject( ChemCompoundsService ) ;

    allCompounds: ChemCompound[] = [] ;

    importDialogVisible:boolean = false ;

    editableCompound: ChemCompound | null = null ;
    selectedCompound: ChemCompound | null = null ;
    selectAll:boolean = false ;

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

    editingSaved( c:ChemCompound ) {
        this.editableCompound = null ;
    }

    editingCancelled() {
        console.log( 'Editing cancelled' );
        this.editableCompound = null ;
    }

    handleImportedCompound( compound: ChemCompound ) {
        this.allCompounds.push( compound )
        this.allCompounds.sort( (c1, c2) => {
            return c1.commonName.localeCompare(c2.commonName);
        });
        this.importDialogVisible = false ;
        this.editableCompound = compound ;
    }

    async compoundSelected( c: ChemCompound ) {
        this.allCompounds.forEach( comp => comp.selected = c.id == comp.id ) ;
        this.selectedCompound = await this.svc.getCompound( c.id ) ;
    }

    nameFilterChanged( $event:any ) {
        const filterText = $event.target.value.trim().toLocaleLowerCase() ;
        this.allCompounds.forEach( c => {
            if( filterText === "" ) {
                c.visible = true ;
            }
            else {
                if( c.commonName.toLowerCase().includes( filterText ) ) {
                    c.visible = true ;
                }
                else if( c.iupacName.toLowerCase().includes( filterText ) ) {
                    c.visible = true ;
                }
                else {
                    c.visible = false ;
                    if( c.selected ) {
                        c.selected = false ;
                        this.selectedCompound = null ;
                    }
                }
            }
        }) ;
    }

    deleteCompound( c: ChemCompound ) {
        if( window.confirm( 'Are you sure you want to delete ' + c.commonName + '?' ) ) {
            this.svc.deleteCompound( c.id )
              .then( () => {
                let index = this.allCompounds.findIndex( item => item.id == c.id) ;
                this.allCompounds.splice( index, 1 ) ;
                if( c.selected ) {
                    this.selectedCompound = null ;
                }
              }) ;
        }
    }

    selectAllOptionChanged() {
        this.allCompounds.forEach( c => {
            c.selectedForCardDownload = this.selectAll
        } ) ;
    }

    downloadFlashCards() {
        console.log( "Downloading flash cards" ) ;
        if( this.allCompounds.filter( c => c.selectedForCardDownload).length == 0 ) {
            window.alert( 'No cards selected for download.' ) ;
            return ;
        }

        console.log( "Compounds selected." ) ;
        let selectedIds:number[] = [] ;
        this.allCompounds.forEach( c => {
            if( c.selectedForCardDownload ) { selectedIds.push( c.id ); }
        }) ;
        console.log( "Downloading flash cards " + selectedIds ) ;
        this.svc.downloadFlashCards( selectedIds ) ;
    }
}