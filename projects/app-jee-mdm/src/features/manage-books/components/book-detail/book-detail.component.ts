import { Component, SkipSelf } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import {Alert, EditableAttributeSaveEvent, EditableInput} from "lib-core";
import { ActivatedRoute } from "@angular/router";
import { ToolbarTitleService } from "lib-core";
import {BookProblemSummary, ChapterProblemSummary, ExerciseProblemSummary } from "../../manage-books.type";

import AlertService = Alert.AlertService;
import {NgClass} from "@angular/common";

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

  bookId:number = 0 ;
  summary:BookProblemSummary ;
  expandedState:Record<number, boolean> = {} ;

  constructor( @SkipSelf() private manageBookSvc:ManageBooksService,
               @SkipSelf() private alertService:AlertService,
               private activeRoute:ActivatedRoute,
               private titleSvc:ToolbarTitleService ) {

    this.bookId = Number( activeRoute.snapshot.params['bookId'] ) ;
    this.titleSvc.setTitle( String( this.bookId ) ) ;

    this.manageBookSvc.getBookProblemSummary( this.bookId )
      .then( data => {
        this.summary = data ;
        this.titleSvc.setTitle( `${data.subjectName} > 
                                 ${data.seriesName} > 
                                 ${data.bookName} > 
                                 ${data.author}` ) ;
      } )
      .catch( () => this.alertService.error( "Could not fetch book problem summary" ) ) ;
  }

  isExpanded( ch:ChapterProblemSummary ):boolean {
    return this.expandedState[ch.chapterNum] || false ;
  }

  toggleChapterExpandedState( ch:ChapterProblemSummary ) {
    let currentExpandedState = this.isExpanded( ch ) ;
    this.expandedState[ch.chapterNum] = !currentExpandedState ;
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
    this.manageBookSvc
      .updateChapterName( this.summary.id,
                          ($evt.target as ChapterProblemSummary).chapterNum,
                          $evt.attributeValue )
      .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
      .catch( msg => this.alertService.error( msg ) ) ;
  }
}
