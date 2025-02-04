import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
} from "lib-core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";

import AlertService = Alert.AlertService;
import { ManageProblemsService } from "../../manage-problems.service";
import {
  ChapterProblemTopicMapping,
  ExerciseProblems, PROBLEM_TYPES,
  ProblemTopicMapping,
} from "../../manage-problems.type";
import { Topic } from "../../../manage-books/manage-books.type";

export enum ProblemGroup {
  ATTACHED,
  DETACHED,
  NOT_AVAILABLE,
  TOTAL
}

@Component( {
  selector: 'topic-chapter-problem-list',
  imports: [
    FormsModule,
    CommonModule,
    PageToolbarComponent,
    NgbDropdownModule
  ],
  templateUrl: './topic-chapter-problem-list.component.html',
  styleUrl: './topic-chapter-problem-list.component.css'
} )
export class TopicChapterProblemListComponent {

  private alertSvc = inject( AlertService ) ;
  private route = inject( ActivatedRoute ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private manageProblemsSvc:ManageProblemsService = inject( ManageProblemsService ) ;

  protected readonly ProblemGroup = ProblemGroup ;
  protected readonly PROBLEM_TYPES = PROBLEM_TYPES;

  topicChapterMappingId:number = 0 ;
  data:ChapterProblemTopicMapping | null = null ;
  selTopic:Topic | null = null ;

  expandedState:Record<number, boolean> = {} ;
  fullyExpanded:boolean = false ;

  constructor() {

    this.topicChapterMappingId = this.route.snapshot.params['topicChapterMappingId'] ;
    this.manageProblemsSvc
        .getChapterProblemTopicMappings( this.topicChapterMappingId )
        .then( res => {
          this.data = res ;
          this.selTopic = res.selTopic ;
          this.titleSvc.setTitle( `${res.book.bookShortName} : ${res.chapterNum} - ${res.chapterName}` ) ;
          this.toggleFullExpansion() ;
        } )
        .catch( (err) => this.alertSvc.error( "Error : " + err ) ) ;
  }

  toggleFullExpansion() {
    this.fullyExpanded = !this.fullyExpanded ;
    this.data?.exercises.forEach( ex => {
      this.expandedState[ex.exerciseNum] = this.fullyExpanded ;
    }) ;
  }

  isExpanded( exerciseNum:number ):boolean {
    return this.expandedState[exerciseNum] || false ;
  }

  toggleChapterExpandedState( exerciseNum:number ) {
    let currentExpandedState = this.isExpanded( exerciseNum ) ;
    this.expandedState[exerciseNum] = !currentExpandedState ;
  }

  toggleSelectionAllProblemsForExercise( ex:ExerciseProblems ) {
    let targetState = !ex.problems[0].selected ;
    ex.problems.forEach( p => p.selected = targetState ) ;
  }

  toggleSelectionOfAllProblemsOfType( ex:ExerciseProblems, type:string ) {
    ex.problems.forEach( p =>
      p.selected = p.problemType === type ? !p.selected : p.selected
    ) ;
  }

  attachProblem( p:ProblemTopicMapping ) {
  }

  detachProblem( p:ProblemTopicMapping ) {
  }

  attachSelectedProblems() {
  }

  detachSelectedProblems() {
  }

  forceAttachSelectedProblems() {
  }

  hasSelectedProblems():boolean  {
    try {
      this.data!.exercises.forEach( ex => {
        ex.problems.forEach( p => {
          if( p.selected ) { throw true ; }
        }) ;
      }) ;
    }
    catch( e ) { return true ; }
    return false ;
  }

  hasSelectedExercises():boolean {
    try {
      this.data!.exercises.forEach( ex => {
        if( ex.selected ) { throw true ; }
      }) ;
    }
    catch( e ) { return true ; }
    return false ;
  }

  selectAllDetachedProblems() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      if( limitToSelectedExercises ) {
        if( ex.selected ) {
          ex.problems.forEach( ptm => {
            if( ptm.topic == null ) { ptm.selected = true ; }
          }) ;
        }
      }
      else {
        ex.problems.forEach( ptm => {
          if( ptm.topic == null ) { ptm.selected = true ; }
        }) ;
      }
    }) ;
  }

  deselectAll() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      if( limitToSelectedExercises ) {
        if( ex.selected ) {
          ex.problems.forEach( ptm => ptm.selected = false ) ;
        }
      }
      else {
        ex.problems.forEach( ptm => ptm.selected = false ) ;
      }
    }) ;
  }

  getProblemCount( problemType:string, group:ProblemGroup = ProblemGroup.TOTAL ):number {
    let count = 0 ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( ptm => {
        if( ptm.problemType === problemType ) {
          if( this.isEligibleForCount( ptm, group ) ) count++ ;
        }
      }) ;
    }) ;
    return count ;
  }

  getTotalProblemCount( group:ProblemGroup = ProblemGroup.TOTAL ):number {
    let count = 0 ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( ptm => {
        if( this.isEligibleForCount( ptm, group ) ) count++ ;
      }) ;
    }) ;
    return count ;
  }

  private isEligibleForCount( ptm:ProblemTopicMapping, group:ProblemGroup ):boolean {

    if( group === ProblemGroup.ATTACHED ) {
      if( ptm.topic != null && ptm.topic.topicId === this.selTopic!.topicId ) return true ;
    }
    else if( group === ProblemGroup.NOT_AVAILABLE ) {
      if( ptm.topic != null && ptm.topic.topicId != this.selTopic!.topicId ) return true ;
    }
    else if( group === ProblemGroup.DETACHED ) {
      if( ptm.topic == null ) return true ;
    }
    else if( group === ProblemGroup.TOTAL ) {
      return true ;
    }
    return false ;
  }

}
