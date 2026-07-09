import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { ProblemApiService } from "@jee-common/services/problem-api.service";

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

const SOLVED_STATES = new Set( [ 'Correct', 'Incorrect', 'Pigeon Explained', 'Pigeon Solved', 'Purge', 'Reassign' ] ) ;
const REMAINING_STATES = new Set( [ 'Assigned', 'Later', 'Redo', 'Pigeon' ] ) ;

function isToday( d: Date ): boolean {
  const now = new Date() ;
  const dt = new Date( d ) ;
  return dt.getFullYear() === now.getFullYear()
      && dt.getMonth() === now.getMonth()
      && dt.getDate() === now.getDate() ;
}

function matchesFilter( p: TopicProblemSO, filter: string ): boolean {
  switch( filter ) {
    case 'total'      : return true ;
    case 'solved'      : return SOLVED_STATES.has( p.problemState ) ;
    case 'remaining'    : return REMAINING_STATES.has( p.problemState ) ;
    case 'solvedToday'   : return SOLVED_STATES.has( p.problemState ) && isToday( p.lastAttemptTime ) ;
    case 'correct'      : return p.problemState === 'Correct' ;
    case 'wrong'       : return p.problemState === 'Incorrect' || p.problemState === 'Pigeon Explained' ;
    case 'later'       : return p.problemState === 'Later' ;
    case 'redo'        : return p.problemState === 'Redo' ;
    case 'pigeon'      : return p.problemState === 'Pigeon' || p.problemState === 'Pigeon Solved' ;
    case 'purged'      : return p.problemState === 'Purge' ;
    case 'reassign'      : return p.problemState === 'Reassign' ;
    default          : return true ;
  }
}

export const FILTER_OPTIONS: { key: string, label: string }[] = [
  { key: 'total',       label: 'Total' },
  { key: 'solved',      label: 'Solved' },
  { key: 'remaining',   label: 'Remaining' },
  { key: 'solvedToday', label: 'Solved Today' },
  { key: 'correct',     label: 'Correct' },
  { key: 'wrong',       label: 'Wrong' },
  { key: 'later',       label: 'Later' },
  { key: 'redo',        label: 'Redo' },
  { key: 'pigeon',      label: 'Pigeon' },
  { key: 'purged',      label: 'Purged' },
  { key: 'reassign',    label: 'Reassign' },
] ;

@Component({
  selector: 'app-problem-browser-screen',
  imports: [
    RouterLink,
  ],
  templateUrl: './problem-browser-screen.component.html',
  styleUrl: './problem-browser-screen.component.css'
})
export class ProblemBrowserScreenComponent implements OnInit {

  protected readonly SConsoleUtil = SConsoleUtil ;
  protected readonly filterOptions = FILTER_OPTIONS ;

  private problemApiSvc = inject( ProblemApiService ) ;
  private activeRoute = inject( ActivatedRoute ) ;

  topicId: number = Number( this.activeRoute.snapshot.params[ 'topicId' ] ) ;

  topicName = signal( '' ) ;
  books: Book[] = [] ;
  numProblems = 0 ;
  loaded = signal( false ) ;
  filter = signal( this.activeRoute.snapshot.queryParams[ 'filter' ] ?? 'total' ) ;

  private allProblems: TopicProblemSO[] = [] ;

  async ngOnInit() {
    this.allProblems = await this.problemApiSvc.getProblems( this.topicId ) ;
    if( this.allProblems.length > 0 ) {
      this.topicName.set( this.allProblems[0].topicName ) ;
    }
    this.applyFilter() ;
    this.loaded.set( true ) ;
  }

  onFilterChange( filter: string ) {
    this.filter.set( filter ) ;
    this.applyFilter() ;
  }

  private applyFilter() {
    const filtered = this.allProblems.filter( p => matchesFilter( p, this.filter() ) ) ;
    this.categorizeProblems( filtered ) ;
  }

  private categorizeProblems( problems: TopicProblemSO[] ) {

    const bookMap: Record<number, Book> = {} ;
    this.books = [] ;
    this.numProblems = problems.length ;

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
        this.books.push( book ) ;
      }
    } ) ;

    if( this.books.length > 0 ) {
      this.books[0].chapters[0].expanded = true ;
      this.books[0].chapters[0].exercises[0].expanded = true ;
    }
  }
}
