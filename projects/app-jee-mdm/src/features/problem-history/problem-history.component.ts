import { Component, inject, ViewChild } from '@angular/core';
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService, DurationPipe, Alert } from "lib-core";
import { FormsModule } from "@angular/forms";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { NgClass, NgIf } from "@angular/common";
import { AttemptHistoryComponent } from "@jee-common/widgets/attempt-history/attempt-history.component";
import { ProblemApiService } from "@jee-common/services/problem-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { Syllabus } from "./entities/syllabus";
import AlertService = Alert.AlertService;
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";

class Exercise {

  problems: TopicProblemSO[] = [] ;
  collapsed = true;

  constructor( public exerciseName: string ) {}

  addProblem( problem: TopicProblemSO ) {
    problem.selected = false ;
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
    AttemptHistoryComponent,
    NgbTooltipModule
  ],
  templateUrl: './problem-history.component.html',
  styleUrl: './problem-history.component.css'
})
export class ProblemHistoryComponent {

  private titleSvc: PageTitleService = inject( PageTitleService ) ;
  private alertSvc:AlertService = inject( AlertService ) ;

  protected readonly Object = Object;
  protected readonly SConsoleUtil = SConsoleUtil;

  protected probApiSvc: ProblemApiService = inject( ProblemApiService ) ;
  protected sylApiSvc: SyllabusApiService = inject( SyllabusApiService ) ;

  @ViewChild( "attemptHistory" )
  private attemptHistory: AttemptHistoryComponent ;

  syllabusMap:Record<string, Syllabus> = {} ;

  selectedSyllabusName = 'IIT Maths' ;
  selectedTopicId = 91 ;
  allProblems: TopicProblemSO[] = [] ;

  filteredProblems: Record<string, BookChapter> = {}
  selectedProblem: TopicProblemSO | null = null ;

  constructor() {
    this.titleSvc.setTitle( "Explore problem history" ) ;
    this.fetchSyllabusAndTopics()
        .then( () => this.topicSelected() ) ;
  }

  private async fetchSyllabusAndTopics() {
    try {
      let syllabusSOList = await this.sylApiSvc.getAllSyllabus() ;
      syllabusSOList.forEach( so => {
        this.syllabusMap[so.syllabusName] = new Syllabus( so )
      } ) ;
    }
    catch( error ) { this.alertSvc.error( 'Error : ' + error ) ; }
  }

  syllabusSelected() {
    this.selectedTopicId = -1 ;
    this.filteredProblems = {} ;
    this.selectedProblem = null ;
  }

  async topicSelected() {
    this.selectedProblem = null ;
    this.allProblems = await this.probApiSvc.getProblems( this.selectedTopicId ) ;
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
  }

  async changeProblemState( problem:TopicProblemSO, targetState: string ) {
    await this.probApiSvc.changeProblemState(
      [problem.problemId],
      problem.topicId,
      targetState
    ) ;
    problem.problemState = targetState ;
    if( problem == this.selectedProblem ) {
      this.attemptHistory.refreshProblemAttempts() ;
    }
  }

  async refreshSelectedProblem() {
    let topicProblem = await this.probApiSvc.getProblem( this.selectedProblem!.problemId ) ;
    this.selectedProblem!.problemState = topicProblem.problemState ;
    this.selectedProblem!.numAttempts = topicProblem.numAttempts ;
    this.selectedProblem!.totalDuration = topicProblem.totalDuration ;
  }

  async changeProblemStateForSelectedProblems( targetState:string ) {

    let problemIds:number[] = [] ;
    let selectedProblems = this.getSelectedProblems() ;

    if( selectedProblems.length > 0 ) {
      selectedProblems.forEach( problem => {
        if( problem.selected ) {
          problemIds.push( problem.problemId ) ;
        }
      }) ;

      await this.probApiSvc.changeProblemState(
        problemIds,
        this.selectedTopicId,
        targetState
      ) ;

      selectedProblems.forEach( problem => {
        problem.problemState = targetState ;
        if( problem == this.selectedProblem ) {
          this.attemptHistory.refreshProblemAttempts() ;
        }
      }) ;
    }
  }

  private getSelectedProblems():TopicProblemSO[] {
    let selectedProblems: TopicProblemSO[] = [];
    this.allProblems.forEach( problem => {
      if( problem.selected ) {
        selectedProblems.push( problem ) ;
      }
    }) ;
    return selectedProblems ;
  }
}
