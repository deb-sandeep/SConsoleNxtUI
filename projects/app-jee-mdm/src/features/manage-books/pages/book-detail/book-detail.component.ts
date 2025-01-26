import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, EditableAttributeSaveEvent, EditableInput} from "lib-core";
import { PageTitleService } from "lib-core";
import { BookProblemSummary, ChapterProblemSummary, ExerciseProblemSummary } from "../../manage-books.type";
import { NgClass } from "@angular/common";
import { ActivatedRoute } from "@angular/router";

import AlertService = Alert.AlertService;

@Component({
  selector: 'book-detail',
  standalone: true,
  imports: [
    EditableInput,
    NgClass
  ],
  providers: [ ManageBooksService, AlertService ],
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
  expandedState:Record<number, boolean> = {} ;
  fullyExpanded:boolean = false ;

  constructor() {

    this.bookId = Number( this.activeRoute.snapshot.params['bookId'] ) ;
    this.titleSvc.setTitle( String( this.bookId ) ) ;

    this.manageBookSvc.getBookProblemSummary( this.bookId )
      .then( data => {
        this.summary = data ;
        this.titleSvc.setTitle( `[${data.book.syllabusName}] >
                                 ${data.book.seriesName} > 
                                 ${data.book.author} >
                                 ${data.book.bookName}` ) ;
        this.linkParent() ;
        this.toggleFullExpansion() ;
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
        .updateChapterName( ch.parent.book.id,
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
}
