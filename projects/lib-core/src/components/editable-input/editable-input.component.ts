import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {FormsModule} from "@angular/forms";

export class EditableAttributeSaveEvent {
  constructor( public target:any,
               public attributeName:string,
               public attributeValue:string ) {}
}

@Component({
    selector: 'editable-input',
    imports: [
        FormsModule
    ],
    styleUrl: '../../../../app-jee-mdm/src/features/manage-books/pages/book-list/book-list.component.css',
    template: `
    @if( isBeingEdited ) {
      <input type="text" [(ngModel)]="editedValue"
             (keyup.enter)="saveEdit()"
             (keyup.escape)="cancelEdit()"
             (blur)="cancelEdit()">
    }
    @else {
      <span (dblclick)="initiateEdit()">{{target[attribute]}}</span>
    }
  `
})
export class EditableInput implements OnInit {

  @Output( "save" )
  saveEmitter:EventEmitter<EditableAttributeSaveEvent> = new EventEmitter<EditableAttributeSaveEvent>() ;

  @Input() target:any = {}
  @Input() attribute:string = '' ;

  isBeingEdited:boolean = false ;
  editedValue:string = '' ;

  ngOnInit() {
    this.editedValue = this.target[this.attribute] ;
  }

  initiateEdit() {
    this.isBeingEdited = true ;
  }

  saveEdit() {
    console.log( this.editedValue ) ;
    let saveEvt:EditableAttributeSaveEvent =
      new EditableAttributeSaveEvent( this.target, this.attribute, this.editedValue ) ;

    this.isBeingEdited = false ;
    this.saveEmitter.emit( saveEvt ) ;
  }

  cancelEdit() {
    this.isBeingEdited = false ;
    this.editedValue = this.target[this.attribute] ;
  }
}

