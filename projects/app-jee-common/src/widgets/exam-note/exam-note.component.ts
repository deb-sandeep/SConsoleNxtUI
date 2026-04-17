import { Component, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { ExamSO } from "@jee-common/util/exam-data-types";
import { FormsModule } from "@angular/forms";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'exam-note',
  imports: [
    FormsModule
  ],
  templateUrl: './exam-note.component.html',
  styleUrl: './exam-note.component.css'
})
export class ExamNoteComponent {

  protected http:HttpClient = inject( HttpClient ) ;

  @ViewChild( 'noteEditor' )
  noteEditorRef : ElementRef<HTMLInputElement> ;

  exam = input<ExamSO>() ;

  protected readonly inEditMode = signal( false ) ;

  editedNote = "" ;

  enableEditMode() {
    this.inEditMode.set( true ) ;
    this.editedNote = this.exam()!.note ;
    setTimeout( () => this.noteEditorRef?.nativeElement.focus() ) ;
  }

  exitEditMode() {
    this.inEditMode.set( false ) ;
    this.editedNote = "" ;
  }

  saveEditedNote(){
    this.saveExamNote( this.exam()!.id, this.editedNote )
        .then( () => {
          this.exam()!.note  = this.editedNote ;
          this.exitEditMode() ;
    }) ;
  }

  saveExamNote( examId: number, editedNote: string ) {
    const url:string = `${environment.apiRoot}/Master/Exam/UpdateNote` ;
    return firstValueFrom( this.http.post<number>( url, {
      examId: examId,
      note: editedNote,
    } ) ) ;
  }
}
