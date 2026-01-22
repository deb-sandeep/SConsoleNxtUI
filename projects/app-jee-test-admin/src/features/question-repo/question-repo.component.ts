import { Component, inject } from "@angular/core";
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";
import { KeyValuePipe, NgClass, NgStyle } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { QuestionRepoService } from "./question-repo.service";
import { SyllabusStatusSO } from "./question-repo.type";


@Component({
  selector: 'question-repo',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    KeyValuePipe,
    NgClass,
    NgStyle,
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
      })   ;
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