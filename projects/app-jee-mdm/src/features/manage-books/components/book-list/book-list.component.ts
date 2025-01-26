import {Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import {
  Alert,
  EditableAttributeSaveEvent,
  EditableInput,
  PageTitleComponent,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import {Router, RouterLink} from "@angular/router";

import AlertService = Alert.AlertService;
import {NgClass} from "@angular/common";

@Component({
  selector: 'book-list',
  standalone: true,
  imports: [
    FormsModule,
    EditableInput,
    RouterLink,
    NgClass,
    PageToolbarComponent,
    ToolbarActionComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {

  private manageBookSvc = inject( ManageBooksService ) ;
  private alertSvc = inject( AlertService ) ;
  private router = inject( Router ) ;

  bookSummaries:BookSummary[] = [] ;

  constructor() {

    this.manageBookSvc.getBookListing()
      .then( (value) => this.bookSummaries = value )
      .catch( () => this.alertSvc.error( "Could not fetch book list" ) ) ;
  }

  uploadFileBtnClicked() {

    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = false ;
    input.accept = '.yaml' ;
    input.addEventListener( 'change', (e:Event) => this.uploadFileSelected(e) ) ;
    input.click() ;
  }

  private uploadFileSelected( e:Event ) {

    const files:FileList|null = (e.target as HTMLInputElement).files ;

    this.manageBookSvc.validateFileOnServer( files!.item(0) as File )
      .then( () => {
        this.alertSvc.success( 'File successfully validated.' ) ;
        this.router.navigateByUrl('/manage-books/upload-review').then()  ;
      } )
      .catch( ( msg ) => {
        this.alertSvc.error( 'File upload failure. ' + msg ) ;
      } ) ;
  }

  saveChangedAttribute($evt: EditableAttributeSaveEvent ) {
    this.manageBookSvc
        .updateBookAttribute( $evt.target as BookSummary,
                              $evt.attributeName, $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertSvc.error( msg ) ) ;
  }

  toggleAllRowsSelection( $evt:Event ) {
    let checked = ($evt.target as HTMLInputElement).checked ;
    this.bookSummaries
        .forEach( b => b.selected = checked ) ;
  }

  isIndeterminateRowSelection():boolean {
    let numSelectedRows = this.bookSummaries.filter( b => b.selected ).length ;
    return numSelectedRows > 0 && numSelectedRows < this.bookSummaries.length ;
  }

  seriesSelected( seriesName:string ) {
    this.bookSummaries.forEach( b => b.selected = b.seriesName === seriesName ) ;
  }

  showMapTopicsPage() {
    console.log( 'Showing map topics page' ) ;
    this.alertSvc.success( 'Showing map topics page' ) ;
  }
}
