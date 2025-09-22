import { Component, inject, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { NgClass } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { LocalStorageService } from "lib-core";
import { StorageKey } from "@jee-common/util/storage-keys";

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
  numProblems:number = 0 ;

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

  displayName() { return `${this.chapterNum}. ${this.chapterName}`; }

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
    this.numProblems++ ;
  }
}

class Exercise {
  exerciseNum: number;
  exerciseName: string;
  problems: Problem[] = [] ;
  parent: Chapter ;
  numProblems:number = 0 ;

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
    this.numProblems++;
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

class LastExercisePointer {

  topicId: number;
  bookId: number;
  chapterNum: number;
  exerciseNum: number;

  constructor( topicId:number, bookId=-1, chapterNum=-1, exerciseNum=-1 ) {
    this.topicId = topicId ;
    this.bookId = bookId ;
    this.chapterNum = chapterNum ;
    this.exerciseNum = exerciseNum ;
  }

  update( problem: TopicProblemSO ) {
    this.bookId = problem.bookId;
    this.chapterNum = problem.chapterNum;
    this.exerciseNum = problem.exerciseNum;
  }
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

  protected readonly SConsoleUtil = SConsoleUtil;

  private stateSvc = inject( SessionStateService ) ;
  private localDb = inject( LocalStorageService ) ;
  private session: Session ;

  private readonly lastExercisePointer: LastExercisePointer ;

  books: Book[] = [];

  hide = output<void>() ;
  selection = output<TopicProblemSO>() ;

  constructor() {

    this.session = this.stateSvc.session ;
    this.lastExercisePointer = this.getLastExercisePointer() ;
    this.categorizeProblems() ;
    this.setExpandedStates() ;
  }

  private categorizeProblems() {

    const problems = this.session.problems ;
    const bookMap: Record<number, Book> = {};

    problems.forEach( tp => {
      const problem = new Problem( tp ) ;
      let book: Book ;
      const lookupKey = problem.getBookId() ;
      if( lookupKey in bookMap ) {
        book = bookMap[ lookupKey ] ;
        book.addProblem( problem ) ;
      }
      else {
        book = new Book( problem ) ;
        bookMap[ lookupKey ] = book ;
        this.books.push( book );
      }
    }) ;
  }

  private setExpandedStates() {

    let lastExercisePointerFound = false ;

    this.books.forEach( book => {
      book.chapters.forEach( chapter => {
        if( this.lastExercisePointer.bookId == book.bookId &&
            this.lastExercisePointer.chapterNum == chapter.chapterNum) {

          chapter.expanded = true ;

          chapter.exercises.forEach( exercise => {
            if( this.lastExercisePointer.exerciseNum == exercise.exerciseNum ) {
              exercise.expanded = true ;
              lastExercisePointerFound = true ;
            }
          })
        }
      })
    }) ;

    if( !lastExercisePointerFound && this.books.length > 0 ) {
      this.books[0].chapters[0].expanded = true ;
      this.books[0].chapters[0].exercises[0].expanded = true ;
    }
  }

  private loadLastExercisePointers() {

    let str = this.localDb.getItem( StorageKey.LAST_EXERCISE_POINTERS ) ;
    let pointers: Record<number, LastExercisePointer> = {} ;

    if( str != null ) {
      pointers = JSON.parse(str) ;
    }
    return pointers;
  }

  private getLastExercisePointer(): LastExercisePointer {

    let pointers: Record<number, LastExercisePointer> = this.loadLastExercisePointers() ;
    const topicId = this.session.topic()!.id ;

    if( topicId in pointers ) {
      let p = pointers[ topicId ] ;
      return new LastExercisePointer( p.topicId, p.bookId, p.chapterNum, p.exerciseNum ) ;
    }
    else {
      return new LastExercisePointer( topicId ) ;
    }
  }

  private saveLastExercisePointer( problem: TopicProblemSO ) {

    this.lastExercisePointer!.update( problem ) ;

    let pointers: Record<number, LastExercisePointer> = this.loadLastExercisePointers() ;
    const topicId = this.session.topic()!.id ;
    pointers[ topicId ] = this.lastExercisePointer! ;

    this.localDb.setItem( StorageKey.LAST_EXERCISE_POINTERS, JSON.stringify( pointers ) ) ;
  }

  problemSelected( problem: TopicProblemSO ){

    this.saveLastExercisePointer( problem ) ;
    this.selection.emit( problem ) ;
    this.hide.emit() ;
  }
}
