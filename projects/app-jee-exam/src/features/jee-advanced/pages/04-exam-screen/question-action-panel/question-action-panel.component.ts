import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'question-action-panel',
  imports: [],
  templateUrl: './question-action-panel.component.html',
  styleUrl: './question-action-panel.component.css'
})
export class QuestionActionPanelComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
