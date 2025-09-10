import { Component, inject, input, Input, output } from '@angular/core';
import { ModalDialogComponent } from "lib-core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChemCompound } from "../chem-compounds.entity";
import { ChemCompoundsService } from "../chem-compounds.service";
import { NgIf } from "@angular/common";

@Component({
  selector: 'import-dialog',
  imports: [
    ModalDialogComponent,
    ReactiveFormsModule,
    FormsModule,
    NgIf
  ],
  templateUrl: './import-dialog.component.html',
  styleUrl: './import-dialog.component.css'
})
export class ImportDialogComponent {

  importQueryParams:any = {
    filterText : "",
    importType : "formula",
    forceImport : false
  } ;
  importDialogMsgs: string[] = [] ;
  serverCommInProgress: boolean = false;

  svc = inject( ChemCompoundsService ) ;
  show = input( false ) ;
  cancel = output() ;
  save = output<ChemCompound>() ;

  importCompound() {
    if( this.validateImportInputs() ) {
      console.log( 'Import inputs validated.' ) ;
      this.serverCommInProgress = true;
      this.svc.importCompound( this.importQueryParams.importType,
            this.importQueryParams.filterText,
            this.importQueryParams.forceImport )
          .then( chemCompound => {
            console.log( 'Compound imported' ) ;
            console.log( chemCompound ) ;
            this.save.emit( chemCompound ) ;
          } )
          .catch( error => {
            this.importDialogMsgs.push( "ERROR: " + error ) ;
          } )
        .finally( () => {
          this.serverCommInProgress = false;
        });
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
