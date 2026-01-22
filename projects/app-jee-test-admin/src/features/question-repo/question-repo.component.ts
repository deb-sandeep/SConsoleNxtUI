import { Component, inject } from "@angular/core";
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";
import { KeyValuePipe, NgClass, NgStyle } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { QuestionRepoService } from "./question-repo.service";
import { SyllabusStatusSO } from "./question-repo.type";
import { StatusChartComponent } from "./status-chart.component";


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

  private syllabusToggleStatus : Record<string, boolean> = {} ;

  numQuestions : number ;
  syllabusStatusMap : Record<string, SyllabusStatusSO> ;
  maxQuestionInCell : number ;

  constructor() {
    this.titleSvc.setTitle( "Question Repository" ) ;
    this.refreshRepoStatus() ;
  }

  public refreshRepoStatus() {
    this.questionRepoSvc.getRepoStatus()
      .then( status => {
        console.log( status ) ;
        this.numQuestions = status.numQuestions ;
        this.syllabusStatusMap = status.syllabusStatusMap ;
        this.extractMaxQuestionInCell() ;
      })   ;
  }

  private extractMaxQuestionInCell() {
    this.maxQuestionInCell = 0 ;
    for( let s of Object.values( this.syllabusStatusMap ) ) {
      for( let t of s.topicStats ) {
        if( t.numQuestions > this.maxQuestionInCell ) {
          this.maxQuestionInCell = t.numQuestions ;
        }
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
}
