import { Component, inject } from '@angular/core';
import { SubmitPanelComponent } from "../submit-panel/submit-panel.component";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { ExamQuestion } from "../../../../../common/so-wrappers";

@Component({
  selector: 'question-palette',
  imports: [
    SubmitPanelComponent
  ],
  templateUrl: './question-palette.component.html',
  styleUrl: './question-palette.component.css'
})
export class QuestionPaletteComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected getStatusClass( question: ExamQuestion ): string {
    switch( question.state ) {
      case "ANSWERED"                  : return "answered" ;
      case "NOT_ANSWERED"              : return "not-answered" ;
      case "NOT_VISITED"               : return "not-visited" ;
      case "MARKED_FOR_REVIEW"         : return "review" ;
      case "ANS_AND_MARKED_FOR_REVIEW" : return "review-answered" ;
    }
  }
}
