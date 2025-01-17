import { Component, SkipSelf } from '@angular/core';
import { ManageBookService } from "../../manage-book.service";
import { BookValidationResult } from "./book-validation-result.type";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BookRenderComponent } from "./renderers/book-render.component";
import { ChapterRenderComponent } from "./renderers/chapter-render.component";
import { ExerciseRenderComponent } from "./renderers/exercise-render.component";
import { Router } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

@Component({
  selector: 'book-upload-review',
  standalone: true,
  imports: [BookRenderComponent, ChapterRenderComponent, ExerciseRenderComponent, NgIf, FormsModule],
  providers: [AlertService],
  templateUrl: './book-upload-review.component.html',
  styleUrl: './book-upload-review.component.css'
})
export class BookUploadReviewComponent {

  result:BookValidationResult | null = null ;
  showAll:boolean = true ;

  constructor( @SkipSelf() private manageBookSvc: ManageBookService,
               @SkipSelf() private alertSvc:AlertService,
               private router:Router ) {
    this.manageBookSvc.validationResult$.subscribe( result => {
      this.result = result ;
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
    this.manageBookSvc.saveBook( this.result?.serverFileName )
      .then( (msg:string) => {
        this.alertSvc.success( msg ) ;
      } )
      .catch( (err:string) => {
        this.alertSvc.error( err ) ;
      } ) ;
    this.router.navigateByUrl( '/manage-books/book-list' ) ;
  }

  backToBookList(): void {
    this.router.navigateByUrl( '/manage-books/book-list' ) ;
  }
}
