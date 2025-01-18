import {Component, SkipSelf } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import { Alert, EditableAttributeSaveEvent, EditableInput } from "lib-core";

import AlertService = Alert.AlertService;

@Component({
  selector: 'book-list',
  standalone: true,
  imports: [
    FormsModule,
    EditableInput
  ],
  providers: [ ManageBooksService, AlertService ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent {

  bookSummaries:BookSummary[] = [] ;

  constructor( @SkipSelf() private manageBookSvc:ManageBooksService,
               @SkipSelf() private alertService:AlertService ) {

    this.manageBookSvc.getBookListing()
      .then( (value) => this.enrichAndStoreBookSummaries( value ) )
      .catch( () => this.alertService.error( "Could not fetch book list" ) ) ;
  }

  private enrichAndStoreBookSummaries( summaries:BookSummary[] ) {
    summaries.forEach( s => {
      this.bookSummaries.push( s ) ;
    }) ;
  }

  attributeChanged( $evt: EditableAttributeSaveEvent ) {
    this.manageBookSvc
        .updateBookAttribute( $evt.target as BookSummary,
                              $evt.attributeName, $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertService.error( msg ) ) ;
  }
}
