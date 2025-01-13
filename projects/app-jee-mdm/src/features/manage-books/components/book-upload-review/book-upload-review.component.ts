import {Component, SkipSelf} from '@angular/core';
import { ManageBookService } from "../../services/manage-book.service";

@Component({
  selector: 'book-upload-review',
  standalone: true,
  imports: [],
  templateUrl: './book-upload-review.component.html',
  styleUrl: './book-upload-review.component.css'
})
export class BookUploadReviewComponent {

  constructor( @SkipSelf() private manageBookSvc: ManageBookService ) {
  }
}
