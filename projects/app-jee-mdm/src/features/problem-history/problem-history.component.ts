import { Component, inject } from '@angular/core';
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService, DurationPipe } from "lib-core";
import { FormsModule } from "@angular/forms";
import { ProblemAttemptSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { ProblemHistoryService } from "./problem-history.service";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { DatePipe, NgClass, NgIf } from "@angular/common";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";

class Exercise {

  problems: TopicProblemSO[] = [] ;
  collapsed = true;

  constructor( public exerciseName: string ) {}

  addProblem( problem: TopicProblemSO ) {
    this.problems.push( problem ) ;
    if( problem.problemState !== 'Assigned' ) {
      this.collapsed = false ;
    }
  }
}

class BookChapter {

  exerciseProblems: Record<string, Exercise> = {} ;
  collapsed = false;

  constructor( public bookChapterName: string ) {}

  addProblem( problem: TopicProblemSO ) {

    let exerciseName = this.getExerciseName( problem ) ;
    let exercise = this.exerciseProblems[ exerciseName ] ;

    if( !exercise ) {
      exercise = new Exercise( exerciseName ) ;
      this.exerciseProblems[ exerciseName ] = exercise ;
    }
    exercise.addProblem( problem ) ;
  }

  private getExerciseName( problem: TopicProblemSO ) {
    return problem.exerciseNum + ". " + problem.exerciseName ;
  }

  expandAll() {
    Object.values( this.exerciseProblems ).forEach( ex => {
      ex.collapsed = false ;
    }) ;
    this.collapsed = false ;
  }

  collapseAll() {
    Object.values( this.exerciseProblems ).forEach( ex => {
      ex.collapsed = true ;
    }) ;
    this.collapsed = true ;
  }
}

@Component({
  selector: 'problem-history',
  imports: [
    AlertsDisplayComponent,
    PageTitleComponent,
    FormsModule,
    NgClass,
    DurationPipe,
    NgIf,
    DatePipe,
    NgbRating
  ],
  templateUrl: './problem-history.component.html',
  styleUrl: './problem-history.component.css'
})
export class ProblemHistoryComponent {

  private titleSvc: PageTitleService = inject( PageTitleService ) ;

  protected readonly Object = Object;
  protected readonly SConsoleUtil = SConsoleUtil;

  protected svc: ProblemHistoryService = inject( ProblemHistoryService ) ;

  selectedSyllabusName = 'IIT Maths' ;
  selectedTopicId = 91 ;
  allProblems: TopicProblemSO[] = [] ;

  filteredProblems: Record<string, BookChapter> = {}
  selectedProblem: TopicProblemSO | null = null ;
  problemAttempts: ProblemAttemptSO[] | null = null ;

  constructor() {
    this.titleSvc.setTitle( "Explore problem history" ) ;
    this.topicSelected().then() ;
  }

  syllabusSelected() {
    this.selectedTopicId = -1 ;
    this.filteredProblems = {} ;
    this.selectedProblem = null ;
    this.problemAttempts = null ;
  }

  async topicSelected() {
    this.allProblems = await this.svc.getProblems( this.selectedTopicId ) ;
    this.computeDisplayProblems() ;
  }

  private computeDisplayProblems() {

    this.filteredProblems = {} ;
    this.allProblems.forEach( problem => {

      if( this.isDisplayable( problem ) ) {
        let bookChName = this.getBookChapterName( problem ) ;
        let bookChapter = this.filteredProblems[ bookChName ] ;

        if( !bookChapter ) {
          bookChapter = new BookChapter( bookChName ) ;
          this.filteredProblems[ bookChName ] = bookChapter ;
        }
        bookChapter.addProblem( problem ) ;
      }
    })
  }

  private isDisplayable( problem: TopicProblemSO ) {
    return true ;
  }

  private getBookChapterName( problem: TopicProblemSO ) {
    return "[" + problem.bookShortName + "] " + problem.chapterNum + ". " + problem.chapterName ;
  }

  getProblemRowClass( problem: TopicProblemSO ) {
    let classNames = [] ;
    switch( problem.problemState ) {
      case 'Assigned'         : classNames.push( 'problem-assigned'         ) ; break ;
      case 'Correct'          : classNames.push( 'problem-correct'          ) ; break ;
      case 'Incorrect'        : classNames.push( 'problem-incorrect'        ) ; break ;
      case 'Redo'             : classNames.push( 'problem-redo'             ) ; break ;
      case 'Later'            : classNames.push( 'problem-later'            ) ; break ;
      case 'Purge'            : classNames.push( 'problem-purge'            ) ; break ;
      case 'Pigeon'           : classNames.push( 'problem-pigeon'           ) ; break ;
      case 'Pigeon Explained' : classNames.push( 'problem-pigeon-explained' ) ; break ;
      case 'Pigeon Solved'    : classNames.push( 'problem-pigeon-solved'    ) ; break ;
    }

    if( this.selectedProblem == problem ) {
      classNames.push( 'problem-selected' ) ;
    }
    return classNames.join( ' ' ) ;
  }

  getDifficultyLevelIcon( problem: TopicProblemSO ) {
    let classNames = [] ;
    if( problem.difficultyLevel > 0 ) {
      classNames.push( 'bi-star-fill' );
      if( problem.difficultyLevel < 4 ) {
        classNames.push( 'problem-difficulty-medium' ) ;
      }
      else if( problem.difficultyLevel < 8 ) {
        classNames.push( 'problem-difficulty-high' ) ;
      }
      else {
        classNames.push( 'problem-difficulty-exceptional' ) ;
      }
    }
    return classNames.join( ' ' ) ;
  }

  expandAll() {
    Object.values( this.filteredProblems ).forEach( bookCh => {
      bookCh.expandAll() ;
    }) ;
  }

  collapseAll() {
    Object.values( this.filteredProblems ).forEach( bookCh => {
      bookCh.collapseAll() ;
    }) ;
  }

  async problemSelected( problem: TopicProblemSO ) {
    this.selectedProblem = problem ;
    this.problemAttempts = await this.svc.getProblemAttempts( problem.problemId ) ;
  }

  problemRatingChanged() {
    this.svc.updateProblemDifficultyLevel(
      this.selectedProblem!.problemId,
      this.selectedProblem!.difficultyLevel
    ).then() ;
  }

  async changePigeonState( targetState: string ) {
    await this.svc.changePigeonState(
      this.selectedProblem!.problemId,
      this.selectedProblem!.topicId,
      this.selectedProblem!.problemState,
      targetState
    ) ;
    this.selectedProblem!.problemState = targetState ;
    this.problemAttempts = await this.svc.getProblemAttempts( this.selectedProblem!.problemId ) ;
  }
}
