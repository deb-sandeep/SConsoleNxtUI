import { Component, inject } from "@angular/core";
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";
import { KeyValuePipe } from "@angular/common";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { QuestionRepoService } from "./question-repo.service";
import { SyllabusStatusSO } from "./question-repo.type";


@Component({
  selector: 'question-repo',
  imports: [
    PageTitleComponent,
    AlertsDisplayComponent,
    KeyValuePipe,
  ],
  templateUrl: './question-repo.component.html',
  styleUrl: './question-repo.component.css'
})
export class QuestionRepoComponent {

  protected readonly SConsoleUtil = SConsoleUtil;

  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private questionRepoSvc : QuestionRepoService = inject( QuestionRepoService ) ;

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
}