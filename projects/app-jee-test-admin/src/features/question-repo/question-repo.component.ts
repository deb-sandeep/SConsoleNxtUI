import { Component, inject } from "@angular/core";
import {
  AlertsDisplayComponent,
  PageTitleComponent,
  PageTitleService,
} from "lib-core";
import { KeyValuePipe, NgClass, NgStyle } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { QuestionRepoService } from "./question-repo.service";
import { QTypeStatusSO, SyllabusStatusSO, TopicStatusSO } from "./question-repo.type";
import { StatusChartComponent } from "./status-chart.component";
import { Router } from "@angular/router";


@Component({
  selector: 'question-repo',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    KeyValuePipe,
    NgClass,
    NgStyle,
    StatusChartComponent,
  ],
  templateUrl: './question-repo.component.html',
  styleUrl: './question-repo.component.css'
})
export class QuestionRepoComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private questionRepoSvc : QuestionRepoService = inject( QuestionRepoService ) ;
  private router : Router = inject( Router ) ;

  private syllabusToggleStatus : Record<string, boolean> = {} ;

  numQuestions : number ;
  syllabusStatusMap : Record<string, SyllabusStatusSO> ;
  topicTotalMap : Record<number, QTypeStatusSO> = {} ;
  maxQuestionInCell : number ;
  maxQuestionsInTopicTotals : number ;

  constructor() {
    this.titleSvc.setTitle( "Question Repository" ) ;
    this.refreshRepoStatus() ;
  }

  public refreshRepoStatus() {
    this.numQuestions = 0 ;
    this.syllabusToggleStatus = {} ;
    this.topicTotalMap = {} ;
    this.maxQuestionInCell = 0 ;
    this.maxQuestionsInTopicTotals = 0 ;

    this.questionRepoSvc.getRepoStatus()
      .then( status => {
        this.numQuestions = status.numQuestions ;
        this.syllabusStatusMap = status.syllabusStatusMap ;
        this.extractMaxQuestionInCell() ;
      })   ;
  }

  private extractMaxQuestionInCell() {
    this.maxQuestionInCell = 0 ;
    this.maxQuestionsInTopicTotals = 0 ;

    for( let s of Object.values( this.syllabusStatusMap ) ) {
      for( let t of s.topicStats ) {
        if( t.numQuestions > this.maxQuestionInCell ) {
          this.maxQuestionInCell = t.numQuestions ;
        }
        this.populateTopicTotal( t ) ;
      }
    }
  }

  private populateTopicTotal( t : TopicStatusSO ) {

    if( !(t.topicId in this.topicTotalMap) ) {
      this.topicTotalMap[ t.topicId ] = {
        type: 'Total',
        numUnassigned: 0,
        numAssigned: 0,
        numAttempted: 0,
        numQuestions: 0,
      } ;
    }

    let topicTotal = this.topicTotalMap[ t.topicId ];

    for( let s of Object.values( t.questionTypeStats ) ) {
      topicTotal.numUnassigned += s!.numUnassigned ;
      topicTotal.numAssigned += s!.numAssigned ;
      topicTotal.numAttempted += s!.numAttempted ;
      topicTotal.numQuestions += s!.numQuestions ;

      if( topicTotal.numQuestions > this.maxQuestionsInTopicTotals ) {
        this.maxQuestionsInTopicTotals = topicTotal.numQuestions ;
      }
    }
  }

  public isSyllabusExpanded( name:string ) : boolean {
    if( !(name in this.syllabusToggleStatus) ) {
      this.syllabusToggleStatus[ name ] = true ;
    }
    return this.syllabusToggleStatus[ name ] ;
  }

  public toggleSyllabusExpandedState( name:string ) : void {
    this.syllabusToggleStatus[name] = !this.isSyllabusExpanded( name ) ;
  }

  public refresh() : void {
    this.refreshRepoStatus() ;
  }

  public openQuestionBrowser( topicId:number, qType:string ) : void {
    this.router.navigate(['/question-browser'], {
      queryParams: {
        topicId: topicId,
        qType: qType
      }
    });
  }
}
