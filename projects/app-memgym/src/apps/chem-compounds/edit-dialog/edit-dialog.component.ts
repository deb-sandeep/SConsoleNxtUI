import { Component, inject, input, output } from '@angular/core';
import { ModalDialogComponent } from "lib-core";
import { ChemCompoundsService } from "../chem-compounds.service";
import { ChemCompound } from "../chem-compounds.entity";
import { FormsModule } from "@angular/forms";
import { MathjaxDirective } from "../../../directives/mathjax-directive";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'edit-dialog',
  imports: [
    ModalDialogComponent,
    FormsModule,
    MathjaxDirective
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.css'
})
export class EditDialogComponent {

  svc = inject( ChemCompoundsService ) ;

  compound = input<ChemCompound|null>( null ) ;

  cancel = output() ;
  save = output<ChemCompound>() ;

  editableCompound: ChemCompound|null = null;
  editDialogMsgs: string[] = [] ;

  ngOnChanges() {
    this.editableCompound = null ;
    if( this.compound() != null ) {
      this.editableCompound = ChemCompound.fromChemCompound( this.compound()! ) ;
    }
  }

  editingCancelled() {
    this.editableCompound = null ;
    this.cancel.emit() ;
  }

  async saveEditedCompound() {
    if( this.validateEditedInputs() ) {
      this.svc.saveCompound( this.editableCompound! )
          .then( () => {
            this.compound()!.commonName = this.editableCompound!.commonName ;
            this.compound()!.iupacName = this.editableCompound!.iupacName ;
            this.compound()!.compactFormula = this.editableCompound!.compactFormula ;
            this.editableCompound = null ;
            this.save.emit( this.compound()! ) ;
          })
          .catch( error => {
            this.editDialogMsgs.push("ERROR: Server save failed." ) ;
          }) ;
    }
  }

  private validateEditedInputs() {
    this.editDialogMsgs = [] ;
    if( this.editableCompound!.commonName.trim().length === 0 ) {
      this.editDialogMsgs.push( "ERROR: Common Name must not be empty" ) ;
    }
    if( this.editableCompound!.iupacName.trim().length === 0 ) {
      this.editDialogMsgs.push( "ERROR: Missing Iupac Name" ) ;
    }
    if( this.editableCompound!.compactFormula.trim().length === 0 ) {
      this.editDialogMsgs.push( "ERROR: Missing CompactFormula" ) ;
    }
    return this.editDialogMsgs.length === 0 ;
  }
}
