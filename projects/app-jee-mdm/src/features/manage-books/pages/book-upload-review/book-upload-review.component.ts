import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { BookValidationResult } from "../../manage-books.type";
import { FormsModule } from "@angular/forms";
import { BookRenderComponent } from "./renderers/book-render.component";
import { ChapterRenderComponent } from "./renderers/chapter-render.component";
import { ExerciseRenderComponent } from "./renderers/exercise-render.component";
import { Router } from "@angular/router";
import { Alert } from "lib-core";

import AlertService = Alert.AlertService;

@Component( {
  selector: 'book-upload-review',
  imports: [ BookRenderComponent, ChapterRenderComponent, ExerciseRenderComponent, FormsModule ],
  templateUrl: './book-upload-review.component.html',
  styleUrl: './book-upload-review.component.css'
} )
export class BookUploadReviewComponent {

  private manageBookSvc = inject( ManageBooksService );
  private alertSvc = inject( AlertService );
  private router = inject( Router );

  result: BookValidationResult | null = null;

  // This is set by the 'Show All' checkbox.
  showAll: boolean = true;

  constructor() {
    this.result = this.manageBookSvc.validationResult() ;
  }

  hasMessages() {
    return this.result != null &&
      (
        this.result.totalMsgCount.numError > 0 ||
        this.result.totalMsgCount.numWarning > 0 ||
        this.result.totalMsgCount.numInfo > 0
      );
  }

  hasErrors() {
    return this.result != null &&
      this.result.totalMsgCount.numError > 0;
  }

  hasWarnings() {
    return this.result != null &&
      this.result.totalMsgCount.numWarning > 0;
  }

  hasInfo() {
    return this.result != null &&
      this.result.totalMsgCount.numInfo > 0;
  }

  async saveBook() {

    try {
      const msg = await this.manageBookSvc.saveBook( this.result?.serverFileName ) ;
      this.alertSvc.success( msg ) ;
    }
    catch( err ) {
      this.alertSvc.error( err as string ) ;
    }
    finally {
      await this.router.navigateByUrl( '/manage-books/book-list' ) ;
    }
  }

  backToBookList(): void {
    this.router.navigateByUrl( '/manage-books/book-list' ).then();
  }
}
