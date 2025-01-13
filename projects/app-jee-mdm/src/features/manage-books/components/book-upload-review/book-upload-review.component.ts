import { Component, SkipSelf } from '@angular/core';
import { ManageBookService } from "../../services/manage-book.service";
import { BookValidationResult } from "../../types/book-validation-result.type";

@Component({
  selector: 'book-upload-review',
  standalone: true,
  imports: [],
  templateUrl: './book-upload-review.component.html',
  styleUrl: './book-upload-review.component.css'
})
export class BookUploadReviewComponent {

  result:BookValidationResult | null = null ;

  constructor( @SkipSelf() private manageBookSvc: ManageBookService ) {}

}
