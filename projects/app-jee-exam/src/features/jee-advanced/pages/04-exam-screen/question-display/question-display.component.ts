import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'question-display',
  imports: [],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
