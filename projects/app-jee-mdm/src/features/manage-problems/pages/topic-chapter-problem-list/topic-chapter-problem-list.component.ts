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
  ExerciseProblems,
  ProblemTopicMapping,
} from "../../manage-problems.type";
import { PROBLEM_TYPES } from "@jee-common/util/master-data-types";
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

  private dragSelection:boolean = false ;
  private readonly dragSelectIcon:HTMLImageElement ;
  private readonly dragDeselectIcon:HTMLImageElement ;

  topicChapterMappingId:number = 0 ;
  bookId:number = 0 ;
  chapterNum:number = 0 ;
  topicId:number = 0 ;

  data:ChapterProblemTopicMapping | null = null ;
  selTopic:Topic | null = null ;

  expandedState:Record<number, boolean> = {} ;
  fullyExpanded:boolean = false ;

  constructor() {

    this.topicChapterMappingId = this.route.snapshot.params['topicChapterMappingId'] ;
    this.topicId = this.route.snapshot.params['topicId'] ;
    this.bookId = this.route.snapshot.params['bookId'] ;
    this.chapterNum = this.route.snapshot.params['chapterNum'] ;

    this.dragSelectIcon = new Image() ;
    this.dragSelectIcon.src = '/core-assets/icons/row-select.png' ;

    this.dragDeselectIcon = new Image() ;
    this.dragDeselectIcon.src = '/core-assets/icons/row-deselect.png' ;

    this.fetchDataFromServer().then() ;
  }

  private async fetchDataFromServer(){
    try {
      this.data = await this.manageProblemsSvc.getProblemTopicMappingsForChapter( this.bookId, this.chapterNum ) ;
      this.selTopic = await this.manageProblemsSvc.getTopic( this.topicId ) ;
      this.titleSvc.setTitle( ` > ${this.data.book.bookShortName} : ${this.data.chapterNum} - ${this.data.chapterName}` ) ;
      this.toggleFullExpansion() ;
    }
    catch( err ) {
      this.alertSvc.error( "Error : " + err ) ;
    }
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
    this.manageProblemsSvc
        .attachProblems( this.topicChapterMappingId, [p], this.selTopic )
        .then() ;
  }

  detachProblem( p:ProblemTopicMapping ) {
    this.manageProblemsSvc
        .detachProblems( [p] )
        .then() ;
  }

  attachSelectedProblems() {
    this.manageProblemsSvc
        .attachProblems( this.topicChapterMappingId,
                         this.getSelectedProblems(),
                         this.selTopic )
        .then() ;
  }

  detachSelectedProblems() {
    this.manageProblemsSvc
        .detachProblems( this.getSelectedProblems() )
        .then() ;
  }

  async attachOnlyAlternateProblems() {

    const problemsToDetach:ProblemTopicMapping[] = [] ;
    const problemsToAttach:ProblemTopicMapping[] = [] ;

    const limitToSelectedExercises = this.hasSelectedExercises() ;
    let counter = 0 ;

    this.data!.exercises.forEach( ex => {
      let isExerciseOperable = limitToSelectedExercises ? ex.selected : true ;
      if( isExerciseOperable ) {
        ex.problems.forEach( ptm => {
          if( counter % 2 == 0 ) {
            // This problem needs to be attached. If the problem is:
            // 1) Attached -> No action
            // 2) Available -> add it to the problemsToAttach list
            // 3) Unavailable -> No action
            if( !this.isPTMUnavailable( ptm ) ) {
              if( this.isPTMAvailable( ptm ) ) {
                problemsToAttach.push( ptm ) ;
              }
              counter++ ;
            }
          }
          else if( counter % 2 == 1 ) {
            // This problem needs to be detached. If the problem is:
            // 1) Attached -> add it to the problemsToDetach list
            // 2) Available -> No action
            // 3) Unavailable -> No action
            if( !this.isPTMUnavailable( ptm ) ) {
              if( this.isPTMAttached( ptm ) ) {
                problemsToDetach.push( ptm ) ;
              }
              counter++ ;
            }
          }
        }) ;
      }
    }) ;

    if( problemsToDetach.length > 0 ) {
      await this.manageProblemsSvc.detachProblems( problemsToDetach ) ;
    }

    if( problemsToAttach.length > 0 ) {
      await this.manageProblemsSvc.attachProblems( this.topicChapterMappingId,
                                                   problemsToAttach,
                                                   this.selTopic ) ;
    }
  }

  attachAllDetached() {
    this.manageProblemsSvc
        .attachProblems( this.topicChapterMappingId,
                         this.getAllDetachedProblems(),
                         this.selTopic )
        .then() ;
  }

  detachAllAttached() {
    this.manageProblemsSvc
        .detachProblems( this.getAllAttachedProblems() )
        .then() ;
  }

  private getSelectedProblems():ProblemTopicMapping[] {

    let selectedProblems:ProblemTopicMapping[] = [] ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( p => {
        if( p.selected ) selectedProblems.push( p ) ;
      }) ;
    }) ;
    return selectedProblems ;
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

  getAllDetachedProblems() {
    const ptMappings:ProblemTopicMapping[] = [] ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( ptm => {
        if( this.isPTMAvailable( ptm ) ) { ptMappings.push( ptm ) }
      }) ;
    }) ;
    return ptMappings ;
  }

  getAllAttachedProblems() {
    const ptMappings:ProblemTopicMapping[] = [] ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( ptm => {
        if( this.isPTMAttached( ptm ) ) {
          ptMappings.push( ptm )
        }
      }) ;
    }) ;
    return ptMappings ;
  }

  selectAllDetachedProblems() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      let isExerciseOperable = limitToSelectedExercises ? ex.selected : true ;
      if( isExerciseOperable ) {
        ex.problems.forEach( ptm => {
          if( this.isPTMAvailable( ptm ) ) { ptm.selected = true ; }
        }) ;
      }
    }) ;
  }

  selectAllAttachedProblems() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      let isExerciseOperable = limitToSelectedExercises ? ex.selected : true ;
      if( isExerciseOperable ) {
        ex.problems.forEach( ptm => {
          if( this.isPTMAttached( ptm ) ) { ptm.selected = true ; }
        }) ;
      }
    }) ;
  }

  protected isPTMAttached( ptm: ProblemTopicMapping ) {
    return ptm.topic != null && ptm.topic!.topicId === this.selTopic?.topicId ;
  }

  protected isPTMAvailable( ptm: ProblemTopicMapping ) {
    return ptm.topic == null ;
  }

  protected isPTMUnavailable( ptm: ProblemTopicMapping ) {
    return ptm.topic != null && ptm.topic!.topicId !== this.selTopic?.topicId ;
  }

  selectAll() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      let isExerciseOperable = limitToSelectedExercises ? ex.selected : true ;
      if( isExerciseOperable ) {
        ex.problems.forEach( ptm => ptm.selected = true ) ;
      }
    }) ;
  }

  deselectAll() {
    let limitToSelectedExercises = this.hasSelectedExercises() ;
    this.data!.exercises.forEach( ex => {
      let isExerciseOperable = limitToSelectedExercises ? ex.selected : true ;
      if( isExerciseOperable ) {
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
      if( ptm.topic != null && ptm.topic.topicId === this.selTopic?.topicId ) return true ;
    }
    else if( group === ProblemGroup.NOT_AVAILABLE ) {
      if( ptm.topic != null && ptm.topic.topicId != this.selTopic?.topicId ) return true ;
    }
    else if( group === ProblemGroup.DETACHED ) {
      if( ptm.topic == null ) return true ;
    }
    else if( group === ProblemGroup.TOTAL ) {
      return true ;
    }
    return false ;
  }

  problemDragStarted( event:DragEvent, p:ProblemTopicMapping ) {
    this.dragSelection = !p.selected ;
    p.selected = this.dragSelection ;

    let img = this.dragSelection ? this.dragSelectIcon : this.dragDeselectIcon ;
    event.dataTransfer?.setDragImage( img, 0, 0 ) ;
  }

  problemDragOver( p:ProblemTopicMapping ) {
    p.selected = this.dragSelection ;
  }
}
