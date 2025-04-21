import { Component, inject, ViewChild } from "@angular/core";
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService, DurationPipe } from "lib-core";
import { ProblemAttemptSO, SyllabusSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { DatePipe, NgClass } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { ProblemApiService } from "@jee-common/services/problem-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import {
  ProblemAttemptComponent
} from "../../../../app-jee-session/src/pages/session/widgets/problem-attempt/problem-attempt.component";
import { AttemptHistoryComponent } from "@jee-common/widgets/attempt-history/attempt-history.component";

class BookChapterProblems {

  pigeons: TopicProblemSO[] = [] ;

  constructor( public bookChapterName: string ) {}

  addProblem( problem: TopicProblemSO ) {
    this.pigeons.push( problem ) ;
  }

  getProblems() {
    return this.pigeons ;
  }
}

class TopicProblems {

  bookChapterProblemMap: Record<string, BookChapterProblems> = {} ;

  constructor( public topicName: string ) {}

  addProblem( problem: TopicProblemSO ) {

    const key ="[<i>" + problem.bookShortName + "</i> ]<br>" + problem.chapterNum + ".&nbsp;&nbsp;" + problem.chapterName ;

    let bookChapterProblems = this.bookChapterProblemMap[ key ] ;
    if( !bookChapterProblems ) {
      bookChapterProblems = new BookChapterProblems( key ) ;
      this.bookChapterProblemMap[ key ] = bookChapterProblems ;
    }
    bookChapterProblems.addProblem( problem ) ;
  }

  getBookChapterProblems() {
    return Object.values( this.bookChapterProblemMap ) ;
  }
}

class SyllabusProblems {

  syllabus: SyllabusSO ;
  topicProblemMap: Record<string, TopicProblems> = {} ;

  constructor( public syllabusName: string ) {}

  addProblem( problem: TopicProblemSO ) {

    let topicProblems = this.topicProblemMap[ problem.topicName ] ;
    if( !topicProblems ) {
      topicProblems = new TopicProblems( problem.topicName ) ;
      this.topicProblemMap[ problem.topicName ] = topicProblems ;
    }
    topicProblems.addProblem( problem ) ;
  }

  getTopicProblems() {
    return Object.values( this.topicProblemMap ) ;
  }
}

@Component({
  selector: 'solve-pigeons',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    NgClass,
    AttemptHistoryComponent,
  ],
  templateUrl: './solve-pigeons.component.html',
  styleUrl: './solve-pigeons.component.css'
})
export class SolvePigeonsComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private problemApiSvc : ProblemApiService = inject( ProblemApiService ) ;
  private syllabusApiSvc : SyllabusApiService = inject( SyllabusApiService ) ;

  private syllabusProblemsMap:Record<string, SyllabusProblems> = {} ;

  private allPigeons: TopicProblemSO[] = [] ;
  protected selectedPigeon:TopicProblemSO|null = null ;
  protected problemAttempts:ProblemAttemptSO[]|null = null ;

  constructor() {
    this.titleSvc.setTitle( "Solve Pigeons" ) ;
    this.refreshPigeons() ;
  }

  public refreshPigeons() {
    this.problemApiSvc.getAllPigeons()
        .then(  pigeons => {
          this.sortPigeons( pigeons ) ;
          if( pigeons.length > 0 ) {
            this.pigeonSelected( pigeons[0] ).then() ;
          }
        } )
        .then( () => this.mapSyllabusSO() );
  }

  private sortPigeons( pigeons: TopicProblemSO[] ) {
    this.syllabusProblemsMap = {} ;
    this.allPigeons = pigeons ;

    pigeons.forEach( pigeon => {
      let syllabusProblems = this.syllabusProblemsMap[ pigeon.syllabusName ] ;
      if( !syllabusProblems ) {
        syllabusProblems = new SyllabusProblems( pigeon.syllabusName ) ;
        this.syllabusProblemsMap[ pigeon.syllabusName ] = syllabusProblems ;
      }
      syllabusProblems.addProblem( pigeon ) ;
    }) ;
  }

  private async mapSyllabusSO() {
    let syllabuses:SyllabusSO[] = await this.syllabusApiSvc.getAllSyllabus() ;
    syllabuses.forEach( syllabus => {
      if( syllabus.syllabusName in this.syllabusProblemsMap ) {
        this.syllabusProblemsMap[ syllabus.syllabusName ].syllabus = syllabus ;
      }
    }) ;
  }

  getSyllabusProblems() {
    return Object.values( this.syllabusProblemsMap ) ;
  }

  async pigeonSelected( pigeon: TopicProblemSO ) {
    this.selectedPigeon = pigeon ;
    this.problemAttempts = await this.problemApiSvc.getProblemAttempts( pigeon.problemId ) ;
  }

  async changePigeonState( targetState: string ) {
    await this.problemApiSvc.changeProblemState(
      this.selectedPigeon!.problemId,
      this.selectedPigeon!.topicId,
      this.selectedPigeon!.problemState,
      targetState
    ) ;

    let index = this.allPigeons.findIndex( pigeon => pigeon == this.selectedPigeon ) ;
    let nextIndex = index + 1 ;

    if( targetState !== 'Pigeon Solved' ) {
      if( index != -1 ) {
        this.allPigeons.splice( index, 1 ) ;
      }
      this.sortPigeons( this.allPigeons ) ;
      nextIndex = index ;
    }
    else {
      this.selectedPigeon!.problemState = targetState ;
    }

    if( nextIndex < this.allPigeons.length ) {
      await this.pigeonSelected( this.allPigeons[nextIndex] ) ;
    }
    else if( this.allPigeons.length > 0 ) {
      await this.pigeonSelected( this.allPigeons[0] ) ;
    }
  }

  getAge( pigeon: TopicProblemSO ) {
    return Math.floor( ( new Date().getTime() - new Date( pigeon.lastAttemptTime ).getTime() ) / 86400000 ) ;
  }
}