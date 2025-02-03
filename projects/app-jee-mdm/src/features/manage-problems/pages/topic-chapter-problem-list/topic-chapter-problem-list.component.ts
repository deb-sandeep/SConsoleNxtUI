import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";

import AlertService = Alert.AlertService;
import { ManageProblemsService } from "../../manage-problems.service";
import {
  ChapterProblemTopicMapping,
  ExerciseProblems,
  ProblemTopicMapping,
  SelectedTopic
} from "../../manage-problems.type";
import { ChapterProblemSummary } from "../../../manage-books/manage-books.type";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";

@Component( {
  selector: 'topic-chapter-problem-list',
  imports: [
    FormsModule,
    CommonModule,
    PageToolbarComponent,
    ToolbarActionComponent,
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

  data:ChapterProblemTopicMapping | null = null ;
  selTopic:SelectedTopic | null = null ;

  expandedState:Record<number, boolean> = {} ;
  fullyExpanded:boolean = false ;

  constructor() {
    const bookId = this.route.snapshot.params['bookId'] ;
    const chapterNum = this.route.snapshot.params['chapterNum'] ;

    this.selTopic = this.manageProblemsSvc.selectedTopic ;

    this.manageProblemsSvc
        .getChapterProblemTopicMappings( bookId, chapterNum )
        .then( res => {
          this.data = res ;
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
}
