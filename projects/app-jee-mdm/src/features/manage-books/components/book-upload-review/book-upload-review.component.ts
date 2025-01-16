import { Component, SkipSelf } from '@angular/core';
import { ManageBookService } from "../../services/manage-book.service";
import { BookValidationResult } from "../../types/book-validation-result.type";
import {BookRenderComponent, ChapterRenderComponent, ExerciseRenderComponent} from "./book-render.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'book-upload-review',
  standalone: true,
  imports: [BookRenderComponent, ChapterRenderComponent, ExerciseRenderComponent, NgIf],
  templateUrl: './book-upload-review.component.html',
  styleUrl: './book-upload-review.component.css'
})
export class BookUploadReviewComponent {

  result:BookValidationResult | null = null ;

  constructor( @SkipSelf() private manageBookSvc: ManageBookService ) {
    this.manageBookSvc.validationResult$.subscribe( result => {
      this.result = result ;
      console.log( 'BookUploadReviewComponent: received result', result ) ;
    } ) ;
  }

  hasMessages() {
    return this.result != null &&
           (
             this.result.totalMsgCount.numError > 0 ||
             this.result.totalMsgCount.numWarning > 0 ||
             this.result.totalMsgCount.numInfo > 0
           ) ;
  }

  hasErrors() {
    return this.result != null &&
           this.result.totalMsgCount.numError > 0 ;
  }

  hasWarnings() {
    return this.result != null &&
           this.result.totalMsgCount.numWarning > 0 ;
  }

  hasInfo() {
    return this.result != null &&
           this.result.totalMsgCount.numInfo > 0 ;
  }

  saveBook():void {
  }

  backToBookList(): void {
  }
}
