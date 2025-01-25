import {Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import { Alert, EditableAttributeSaveEvent, EditableInput } from "lib-core";
import { RouterLink } from "@angular/router";

import AlertService = Alert.AlertService;
import {NgClass} from "@angular/common";

@Component({
  selector: 'book-list',
  standalone: true,
  imports: [
    FormsModule,
    EditableInput,
    RouterLink,
    NgClass
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {

  private manageBookSvc = inject( ManageBooksService ) ;
  private alertSvc = inject( AlertService ) ;

  bookSummaries:BookSummary[] = [] ;

  constructor() {

    this.manageBookSvc.getBookListing()
      .then( (value) => this.bookSummaries = value )
      .catch( () => this.alertSvc.error( "Could not fetch book list" ) ) ;
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
}
