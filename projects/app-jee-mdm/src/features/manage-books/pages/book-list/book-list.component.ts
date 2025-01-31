import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import {
  Alert,
  EditableAttributeSaveEvent,
  EditableInput,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { Router, RouterLink } from "@angular/router";

import AlertService = Alert.AlertService;
import { NgClass, NgIf } from "@angular/common";

@Component( {
    selector: 'book-list',
    imports: [
        FormsModule,
        EditableInput,
        RouterLink,
        NgClass,
        PageToolbarComponent,
        ToolbarActionComponent,
        NgIf
    ],
    templateUrl: './book-list.component.html',
    styleUrl: './book-list.component.css'
} )
export class BookListComponent {

  private manageBookSvc = inject( ManageBooksService );
  private alertSvc = inject( AlertService );
  private router = inject( Router );

  bookSummaries: BookSummary[] = [];

  constructor() {

    this.manageBookSvc.getBookListing()
        .then( ( value ) => this.bookSummaries = value )
        .catch( () => this.alertSvc.error( "Could not fetch book list" ) );
  }

  uploadFileBtnClicked() {

    const input: HTMLInputElement = document.createElement( 'input' );
    input.type = 'file';
    input.multiple = false;
    input.accept = '.yaml';
    input.addEventListener( 'change', ( e: Event ) => this.uploadFileSelected( e ) );
    input.click();
  }

  private uploadFileSelected( e: Event ) {

    const files: FileList | null = ( e.target as HTMLInputElement ).files;

    this.manageBookSvc.validateFileOnServer( files!.item( 0 ) as File )
        .then( () => {
          this.alertSvc.success( 'File successfully validated.' );
          this.router.navigateByUrl( '/manage-books/upload-review' ).then();
        } )
        .catch( ( msg ) => {
          this.alertSvc.error( 'File upload failure. ' + msg );
        } );
  }

  saveChangedAttribute( $evt: EditableAttributeSaveEvent ) {
    this.manageBookSvc
        .updateBookAttribute( $evt.target as BookSummary,
                              $evt.attributeName,
                              $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertSvc.error( msg ) );
  }

  toggleAllRowsSelection( $evt: Event ) {
    let checked = ( $evt.target as HTMLInputElement ).checked;
    this.bookSummaries
        .forEach( b => b.selected = checked );
  }

  isIndeterminateRowSelection(): boolean {
    let numSelectedRows = this.bookSummaries.filter( b => b.selected ).length;
    return numSelectedRows > 0 && numSelectedRows < this.bookSummaries.length;
  }

  seriesSelected( seriesName: string ) {
    this.bookSummaries.forEach( b => b.selected = b.seriesName === seriesName );
  }

  syllabusSelected( syllabusName: string ) {
    this.bookSummaries.forEach( b => b.selected = b.syllabusName === syllabusName );
  }

  showMapTopicsPage() {
    let syllabusSet: Set<string> = new Set<string>(
      this.bookSummaries
          .filter( b => b.selected )
          .map( b => b.syllabusName || '---' )
    );
    if ( syllabusSet.size === 0 ) {
      this.alertSvc.error( 'No books selected' );
    }
    else if ( syllabusSet.size > 1 ) {
      this.alertSvc.error( 'Selected books should belong to the same syllabus' );
    }
    else if ( syllabusSet.has( '---' ) ) {
      this.alertSvc.error( 'Can\'t map books with no syllabus assigned' );
    }
    else {
      this.manageBookSvc.setSelectedBooks( this.bookSummaries.filter( b => b.selected ) );
      this.router.navigateByUrl( '/manage-books/topic-mapping' ).then();
    }
  }
}
