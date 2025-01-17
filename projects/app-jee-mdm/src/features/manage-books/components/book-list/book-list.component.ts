import {Component, SkipSelf } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;
import {BookRenderComponent} from "../book-upload-review/renderers/book-render.component";
import {ChapterRenderComponent} from "../book-upload-review/renderers/chapter-render.component";
import {ExerciseRenderComponent} from "../book-upload-review/renderers/exercise-render.component";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'book-list',
  standalone: true,
  imports: [
    BookRenderComponent,
    ChapterRenderComponent,
    ExerciseRenderComponent,
    FormsModule
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
      s.isBeingEdited = false ;
      s.editedBookShortName = s.bookShortName ;

      this.bookSummaries.push( s ) ;
    }) ;
  }

  saveBookEdit( book:BookSummary ) {
    console.log( 'Saving book edit' ) ;
  }

  cancelBookEdit( book:BookSummary ) {
    console.log( 'Cancelling book edit' ) ;
  }
}
