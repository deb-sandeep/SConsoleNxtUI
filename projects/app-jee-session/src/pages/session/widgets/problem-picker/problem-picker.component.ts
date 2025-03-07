import { Component, inject, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";
import { TopicProblemSO } from "@jee-common/master-data-types";
import { NgClass } from "@angular/common";

class Book {
  bookId: number;
  bookShortName: string;
  bookSeries: string;
  chapters: Chapter[] = [] ;

  private chapterMap: Record<number, Chapter> = {};

  constructor( problem: Problem ) {
    this.bookId = problem.so.bookId ;
    this.bookShortName = problem.so.bookShortName ;
    this.bookSeries = problem.so.bookSeries ;
    this.addProblem( problem ) ;
  }

  displayName() { return this.bookShortName; }

  addProblem( problem: Problem ) {
    let chapter: Chapter;
    const lookupKey = problem.getChapterNum() ;

    if( lookupKey in this.chapterMap ) {
      chapter = this.chapterMap[lookupKey];
      chapter.addProblem( problem ) ;
    }
    else {
      chapter = new Chapter( problem, this ) ;
      this.chapters.push( chapter ) ;
      this.chapterMap[lookupKey] = chapter ;
    }
  }
}

class Chapter {
  chapterNum: number;
  chapterName: string;
  exercises: Exercise[] = [] ;
  parent: Book ;

  expanded = false ;

  private exerciseMap: Record<number, Exercise> = {};

  constructor( problem:Problem, book:Book ) {
    this.chapterNum = problem.so.chapterNum;
    this.chapterName = problem.so.chapterName;
    this.parent = book;
    this.addProblem( problem ) ;
  }

  toggleExpansion() {
    this.expanded = !this.expanded;
    this.exercises.forEach( (exercise: Exercise) => { exercise.expanded = false; } ) ;
  }

  displayName() { return `${this.chapterNum}.&nbsp;&nbsp;${this.chapterName}`; }

  addProblem( problem: Problem ) {
    let exercise: Exercise ;
    const lookupKey = problem.getExerciseNum() ;

    if( lookupKey in this.exerciseMap ) {
      exercise = this.exerciseMap[ lookupKey ];
      exercise.addProblem( problem ) ;
    }
    else {
      exercise = new Exercise( problem, this ) ;
      this.exercises.push( exercise ) ;
      this.exerciseMap[ lookupKey ] = exercise ;
    }
  }
}

class Exercise {
  exerciseNum: number;
  exerciseName: string;
  problems: Problem[] = [] ;
  parent: Chapter ;

  expanded = false ;

  constructor( problem:Problem, chapter:Chapter ) {
    this.exerciseNum = problem.so.exerciseNum;
    this.exerciseName = problem.so.exerciseName;
    this.parent = chapter;
    this.addProblem( problem ) ;
  }

  displayName() { return this.exerciseName;}

  addProblem( problem: Problem ) {
    this.problems.push( problem );
  }
}

class Problem {
  problemId: number;
  so: TopicProblemSO ;
  parent: Exercise ;

  constructor( tp: TopicProblemSO ) {
    this.so = tp ;
    this.problemId = tp.problemId ;
  }

  displayName() { return this.so.problemKey.replaceAll( '/', ' / ' ) } ;

  getBookId() { return this.so.bookId ; }
  getChapterNum() { return this.so.chapterNum ; }
  getExerciseNum() { return this.so.exerciseNum ; }
}

@Component({
  selector: 'problem-picker',
  imports: [
    NgClass
  ],
  templateUrl: './problem-picker.component.html',
  styleUrl: './problem-picker.component.css'
})
export class ProblemPickerComponent {

  private stateSvc = inject( SessionStateService ) ;
  private session: Session ;

  books: Book[] = [];

  hide = output<void>() ;
  selection = output<TopicProblemSO>() ;

  constructor() {
    this.session = this.stateSvc.session ;
    this.categorizeProblems() ;
  }

  private categorizeProblems() {
    const problems = this.session.problems ;
    const bookMap: Record<number, Book> = {};

    problems.forEach( tp => {
      const problem = new Problem( tp ) ;
      let book: Book ;
      const lookupKey = problem.getBookId() ;
      if( lookupKey in bookMap ) {
        book = bookMap[ lookupKey];
        book.addProblem( problem ) ;
      }
      else {
        book = new Book( problem ) ;
        bookMap[ lookupKey ] = book ;
        this.books.push( book );
      }
    }) ;

    if( this.books.length > 0 ) {
      this.books[0].chapters[0].expanded = true ;
      this.books[0].chapters[0].exercises[0].expanded = true ;
    }
  }

  problemSelected(problem: TopicProblemSO){
    this.selection.emit( problem ) ;
    this.hide.emit() ;
  }

  getProblemIcon( state: string ) {
    switch( state ) {
      case 'Assigned': return 'bi-crosshair icon' ;
      case 'Later': return 'bi-calendar2-event icon' ;
      case 'Redo': return 'bi-arrow-clockwise icon' ;
      case 'Pigeon': return 'bi-twitter icon' ;
      default: return 'bi-crosshair icon' ;
    }
  }
}
