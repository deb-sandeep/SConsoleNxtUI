import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import { Alert, EditableAttributeSaveEvent, EditableInput } from "lib-core";
import { RouterLink } from "@angular/router";

import AlertService = Alert.AlertService;

@Component({
  selector: 'book-list',
  standalone: true,
  imports: [
    FormsModule,
    EditableInput,
    RouterLink
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
}
