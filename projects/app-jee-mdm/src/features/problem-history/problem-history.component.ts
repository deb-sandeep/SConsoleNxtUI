import { Component, inject } from '@angular/core';
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService, DurationPipe } from "lib-core";
import { FormsModule } from "@angular/forms";
import { TopicProblemSO } from "@jee-common/master-data-types";
import { ProblemHistoryService } from "./problem-history.service";
import { SConsoleUtil } from "@jee-common/common-util";
import { NgClass, NgIf } from "@angular/common";

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
    NgIf
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

  constructor() {
    this.titleSvc.setTitle( "Explore problem history" ) ;
    this.topicSelected().then() ;
  }

  syllabusSelected() {
    this.selectedTopicId = -1 ;
    this.filteredProblems = {} ;
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
    switch( problem.problemState ) {
      case 'Assigned':         return 'problem-assigned' ;
      case 'Correct':          return 'problem-correct' ;
      case 'Incorrect':        return 'problem-incorrect' ;
      case 'Redo':             return 'problem-redo' ;
      case 'Later':            return 'problem-later' ;
      case 'Purge':            return 'problem-purge' ;
      case 'Pigeon':           return 'problem-pigeon' ;
      case 'Pigeon Explained': return 'problem-pigeon-explained' ;
      case 'Pigeon Solved':    return 'problem-pigeon-solved' ;
    }
    return '' ;
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
}
