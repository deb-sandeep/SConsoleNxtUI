import { Component, SkipSelf } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookSummary } from "../../manage-books.type";
import { Alert, EditableAttributeSaveEvent, EditableInput } from "lib-core";

import AlertService = Alert.AlertService;

@Component({
  selector: 'book-detail',
  standalone: true,
  imports: [
    EditableInput
  ],
  providers: [ ManageBooksService, AlertService ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent {

  constructor( @SkipSelf() private manageBookSvc:ManageBooksService,
               @SkipSelf() private alertService:AlertService ) {
  }
}
