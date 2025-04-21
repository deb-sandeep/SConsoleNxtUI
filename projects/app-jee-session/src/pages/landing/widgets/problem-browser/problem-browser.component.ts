import { Component, inject, input, output } from '@angular/core';
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";
import { TopicProblemSO, TopicSO } from "@jee-common/util/master-data-types";
import { NgClass } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { SessionNetworkService } from "../../../../service/session-network.service";

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

@Component({
  selector: 'problem-browser',
  imports: [
    NgClass
  ],
  templateUrl: './problem-browser.component.html',
  styleUrl: './problem-browser.component.css'
})
export class ProblemBrowserComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private networkSvc = inject( SessionNetworkService ) ;

  books: Book[] = [];
  numProblems:number = 0 ;

  topic = input.required<TopicSO>() ;
  hide = output<void>() ;

  constructor() {}

  async ngOnInit() {
    this.categorizeProblems( await this.networkSvc.getActiveProblemsForTopic( this.topic()!.id ) ) ;
  }

  private categorizeProblems( problems:TopicProblemSO[] ) {

    const bookMap: Record<number, Book> = {};

    this.numProblems = problems.length;

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
}
