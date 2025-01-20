import { Component, SkipSelf } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, EditableInput } from "lib-core";
import { ActivatedRoute } from "@angular/router";
import { ToolbarTitleService } from "lib-core";

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

  bookId:number = 0 ;

  constructor( @SkipSelf() private manageBookSvc:ManageBooksService,
               @SkipSelf() private alertService:AlertService,
               private activeRoute:ActivatedRoute,
               private titleSvc:ToolbarTitleService ) {
    this.bookId = Number( activeRoute.snapshot.params['bookId'] ) ;
    this.titleSvc.setTitle( String( this.bookId ) ) ;
  }
}
