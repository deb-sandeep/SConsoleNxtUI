import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'question-status-legend',
  imports: [],
  templateUrl: './question-status-legend.component.html',
  styleUrl: './question-status-legend.component.css'
})
export class QuestionStatusLegendComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
