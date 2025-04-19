import { Component, ElementRef, inject, output, ViewChild } from '@angular/core';

import { FormsModule } from "@angular/forms";
import { ModalDialogComponent } from "lib-core";
import { ChapterProblemSummary } from "../../../manage-books.type";
import { ManageBooksService } from "../../../manage-books.service";

@Component({
  selector: 'new-exercise-dialog',
  imports: [
    ModalDialogComponent,
    FormsModule,
  ],
  templateUrl: './new-exercise-dialog.component.html',
  styleUrl: './new-exercise-dialog.component.css'
})
export class NewExerciseDialogComponent {

  private manageBookSvc = inject( ManageBooksService ) ;

  chapter: ChapterProblemSummary|null ;
  exerciseName: string = '' ;
  exerciseMetadata: string = '' ;
  messages: string[] = [] ;

  @ViewChild( 'exerciseNameInput' )
  exerciseNameInput: ElementRef<HTMLInputElement> ;

  success = output<boolean>() ;

  setChapterProblemSummary( ch: ChapterProblemSummary|null ){
    this.chapter = ch ;
    setTimeout( () => {
      this.exerciseNameInput.nativeElement.focus() ;
    }, 100 ) ;
  }

  hideDialog() {
    this.chapter = null ;
    this.exerciseName = '' ;
    this.exerciseMetadata = '' ;
  }

  async createNewExercise() {

    if( this.validateInputs() ) {
      this.messages = await this.manageBookSvc.createNewExercise(
        this.chapter!.parent.book.id,
        this.chapter!.chapterNum,
        this.exerciseName,
        this.exerciseMetadata ) ;

      if( this.messages.length === 0 ) {
        this.hideDialog() ;
        this.success.emit( true ) ;
      }
    }
  }

  // Returns true if inputs are valid, false otherwise.
  private validateInputs() {
    this.messages = [] ;
    if( this.exerciseName.trim().length === 0 ) {
      this.messages.push( 'ERROR: Exercise name cant be empty.' ) ;
    }
    if( this.exerciseMetadata.trim().length === 0 ) {
      this.messages.push( 'ERROR: Exercise metadata cant be empty.' ) ;
    }
    return this.messages.length === 0 ;
  }
}
