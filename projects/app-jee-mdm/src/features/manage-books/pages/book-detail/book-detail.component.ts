import { Component, inject, ViewChild } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, EditableAttributeSaveEvent, EditableInput} from "lib-core";
import { PageTitleService } from "lib-core";
import { BookProblemSummary, ChapterProblemSummary, ExerciseProblemSummary } from "../../manage-books.type";
import { NgClass, NgIf } from "@angular/common";
import { ActivatedRoute } from "@angular/router";

import AlertService = Alert.AlertService;
import { NewExerciseDialogComponent } from "./new-exercise-dialog/new-exercise-dialog.component";

@Component( {
  selector: 'book-detail',
  imports: [
    EditableInput,
    NgClass,
    NgIf,
    NewExerciseDialogComponent
  ],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent {

  private manageBookSvc = inject( ManageBooksService ) ;
  private alertSvc = inject( AlertService ) ;
  private titleSvc = inject( PageTitleService ) ;
  private activeRoute = inject( ActivatedRoute ) ;

  bookId:number = 0 ;
  summary:BookProblemSummary | null ;
  totalProblems:number = 0 ;
  expandedState:Record<number, boolean> = {} ;
  fullyExpanded:boolean = false ;

  @ViewChild( "newExerciseDialog" )
  newExerciseDialog: NewExerciseDialogComponent ;

  constructor() {

    this.bookId = Number( this.activeRoute.snapshot.params['bookId'] ) ;
    this.titleSvc.setTitle( ' > ' + String( this.bookId ) ) ;

    this.refresh() ;
  }

  protected refresh() {

    this.summary = null ;
    this.totalProblems = 0 ;
    this.expandedState = {} ;
    this.fullyExpanded = false ;

    this.manageBookSvc.getBookProblemSummary( this.bookId )
        .then( data => {
          this.summary = data ;
          this.titleSvc.setTitle( ` > [${data.book.syllabusName}] >
                                 ${data.book.seriesName} > 
                                 ${data.book.author} >
                                 ${data.book.bookName}` ) ;
          this.linkParent() ;
          this.toggleFullExpansion() ;
          this.computeTotalNumProblems() ;
        } )
        .catch( () => this.alertSvc.error( "Could not fetch book problem summary" ) ) ;
  }

  private linkParent() {
    this.summary?.chapterProblemSummaries.forEach( ch => {
      ch.parent = this.summary as BookProblemSummary ;
      ch.exerciseProblemSummaries.forEach( ex => {
        ex.parent = ch ;
      }) ;
    })
  }

  private computeTotalNumProblems() {
    this.summary?.chapterProblemSummaries.forEach( ch => {
      this.totalProblems += this.getTotalProblemCountForChapter( ch ) ;
    })
  }

  isExpanded( ch:ChapterProblemSummary ):boolean {
    return this.expandedState[ch.chapterNum] || false ;
  }

  toggleChapterExpandedState( ch:ChapterProblemSummary ) {
    let currentExpandedState = this.isExpanded( ch ) ;
    this.expandedState[ch.chapterNum] = !currentExpandedState ;
  }

  toggleFullExpansion() {
    this.fullyExpanded = !this.fullyExpanded ;
    this.summary?.chapterProblemSummaries.forEach( ch => {
      this.expandedState[ch.chapterNum] = this.fullyExpanded ;
    }) ;
  }

  getChapterProblemTypeCount( ch:ChapterProblemSummary, problemType:string ):number {
    let count:number = 0 ;
    ch.exerciseProblemSummaries.forEach( ex => {
      Object.entries( ex.problemTypeCount ).forEach( ([key, value]) => {
        if( key === problemType ) {
          count += value ;
        }
      })
    }) ;
    return count ;
  }

  getTotalProblemCountForExercise( ex:ExerciseProblemSummary ):number {
    let count:number = 0 ;
    Object.values( ex.problemTypeCount ).forEach( (value) => {
      count += value ;
    }) ;
    return count ;
  }

  getTotalProblemCountForChapter( ch:ChapterProblemSummary ):number {
    let count:number = 0 ;
    ch.exerciseProblemSummaries.forEach( ex => {
      count += this.getTotalProblemCountForExercise( ex ) ;
    }) ;
    return count ;
  }

  saveUpdatedChapterName($evt: EditableAttributeSaveEvent ) {
    let ch = $evt.target as ChapterProblemSummary ;
    this.manageBookSvc
        .saveChapterName( ch.parent.book.id,
                            ch.chapterNum,
                            $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertSvc.error( msg ) ) ;
  }

  saveUpdatedExerciseName( $evt: EditableAttributeSaveEvent ) {
    let ex = $evt.target as ExerciseProblemSummary ;
    this.manageBookSvc
        .updateExerciseName( ex.parent.parent.book.id,
                             ex.parent.chapterNum,
                             ex.exerciseNum,
                             $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertSvc.error( msg ) ) ;
  }

  addNewChapter() {

    let chProbSummaries = this.summary!.chapterProblemSummaries ;
    let newChNum = 1 ;

    if( chProbSummaries.length > 0 ) {
      let lastChSumamry = chProbSummaries[chProbSummaries.length-1] ;
      newChNum = lastChSumamry.chapterNum + 1 ;
    }

    this.manageBookSvc
      .saveChapterName( this.summary!.book.id, newChNum, 'New Chapter' )
      .then( ( ch ) => {
        let newChSummary: ChapterProblemSummary = {
          chapterNum: ch.chapterNum,
          chapterName: ch.chapterName,
          exerciseProblemSummaries: [],
          parent: this.summary!,
        } ;
        this.summary!.chapterProblemSummaries.push( newChSummary ) ;
      })
  }
}
