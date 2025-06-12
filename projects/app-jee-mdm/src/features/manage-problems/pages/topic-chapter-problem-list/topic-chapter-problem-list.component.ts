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
import { SConsoleUtil } from "@jee-common/util/common-util";

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
  private probSvc: ManageProblemsService = inject( ManageProblemsService ) ;

  protected readonly ProblemGroup = ProblemGroup ;
  protected readonly SConsoleUtil = SConsoleUtil;
  protected readonly PROBLEM_TYPES = PROBLEM_TYPES;

  private dragSelection:boolean = false ;
  private readonly dragSelectIcon:HTMLImageElement ;
  private readonly dragDeselectIcon:HTMLImageElement ;

  topicChapterMappingId:number = 0 ;
  bookId:number = 0 ;
  chapterNum:number = 0 ;
  topicId:number = 0 ;

  data:ChapterProblemTopicMapping | null = null ;
  problemState: Record<number, string> = {} ; // Key - problem id, value - problem state
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
      this.data = await this.probSvc.getProblemTopicMappingsForChapter( this.bookId, this.chapterNum ) ;
      (await this.probSvc.getProblemState( this.bookId, this.chapterNum )).forEach( s => {
        this.problemState[s.problemId] = s.state ;
      })
      this.selTopic = await this.probSvc.getTopic( this.topicId ) ;
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
    if( this.isAttachable( p ) ) {
      this.probSvc
          .attachProblems( this.topicChapterMappingId, [p], this.selTopic )
          .then() ;
    }
  }

  detachProblem( p:ProblemTopicMapping ) {
    if( this.isDetachable( p ) ) {
      this.probSvc
          .detachProblems( [p] )
          .then() ;
    }
  }

  attachSelectedProblems() {
    const problemsToAttach = this.selectOnlyAttachableProblems( this.getSelectedProblems() ) ;
    this.probSvc
        .attachProblems( this.topicChapterMappingId,
                         problemsToAttach,
                         this.selTopic )
        .then() ;
  }

  detachSelectedProblems() {
    const problemsToDetach = this.selectOnlyDetachableProblems( this.getSelectedProblems() ) ;
    this.probSvc
        .detachProblems( problemsToDetach )
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
            // 2) Available -> add it to problemsToAttach list
            // 3) Unavailable -> No action
            if( !this.isMappedToDifferentTopic( ptm ) ) {
              if( this.isProblemUnmapped( ptm ) ) {
                problemsToAttach.push( ptm ) ;
              }
              counter++ ;
            }
          }
          else if( counter % 2 == 1 ) {
            // This problem needs to be detached. If the problem is:
            // 1) Attached -> add it to problemsToDetach list
            // 2) Available -> No action
            // 3) Unavailable -> No action
            if( !this.isMappedToDifferentTopic( ptm ) ) {
              if( this.isMappedToCurrentTopic( ptm ) ) {
                if( this.isDetachable( ptm ) ) {
                  problemsToDetach.push( ptm ) ;
                }
              }
              counter++ ;
            }
          }
        }) ;
      }
    }) ;

    if( problemsToDetach.length > 0 ) {
      await this.probSvc.detachProblems( problemsToDetach ) ;
    }

    if( problemsToAttach.length > 0 ) {
      await this.probSvc.attachProblems( this.topicChapterMappingId,
                                                   problemsToAttach,
                                                   this.selTopic ) ;
    }
  }

  attachAllDetached() {
    const problemsToAttach = this.selectOnlyAttachableProblems( this.getAllDetachedProblems() ) ;
    this.probSvc
        .attachProblems( this.topicChapterMappingId,
                         problemsToAttach,
                         this.selTopic )
        .then() ;
  }

  detachAllAttached() {
    const problemsToDetach = this.selectOnlyDetachableProblems( this.getAllAttachedProblems() ) ;
    this.probSvc
        .detachProblems( problemsToDetach )
        .then() ;
  }

  private selectOnlyAttachableProblems( problems: ProblemTopicMapping[] ) {
    let attachableProblems:ProblemTopicMapping[] = [] ;
    problems.forEach( ptm => {
      if( this.isAttachable( ptm ) ) {
        attachableProblems.push( ptm ) ;
      }
    }) ;
    return attachableProblems ;
  }

  private selectOnlyDetachableProblems( problems: ProblemTopicMapping[] ) {
    let detachableProblems:ProblemTopicMapping[] = [] ;
    problems.forEach( ptm => {
      if( this.isDetachable( ptm ) ) {
        detachableProblems.push( ptm ) ;
      }
    }) ;
    return detachableProblems ;
  }

  isAttachable( p: ProblemTopicMapping ): boolean {
    return p.topic == null ;
  }

  isDetachable( p: ProblemTopicMapping ): boolean {
    if( p.topic != null ) {
      if( p.topic.topicId == this.selTopic?.topicId ) {
        if( this.problemState[ p.problemId ] === 'Assigned' ) {
          return true ;
        }
      }
    }
    return false ;
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
        if( this.isProblemUnmapped( ptm ) ) { ptMappings.push( ptm ) }
      }) ;
    }) ;
    return ptMappings ;
  }

  getAllAttachedProblems() {
    const ptMappings:ProblemTopicMapping[] = [] ;
    this.data!.exercises.forEach( ex => {
      ex.problems.forEach( ptm => {
        if( this.isMappedToCurrentTopic( ptm ) ) {
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
          if( this.isProblemUnmapped( ptm ) ) { ptm.selected = true ; }
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
          if( this.isMappedToCurrentTopic( ptm ) ) { ptm.selected = true ; }
        }) ;
      }
    }) ;
  }

  protected isMappedToCurrentTopic( ptm: ProblemTopicMapping ) {
    return ptm.topic != null && ptm.topic!.topicId === this.selTopic?.topicId ;
  }

  protected isProblemUnmapped( ptm: ProblemTopicMapping ) {
    return ptm.topic == null ;
  }

  protected isMappedToDifferentTopic( ptm: ProblemTopicMapping ) {
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
