import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'submit-panel',
  imports: [],
  templateUrl: './submit-panel.component.html',
  styleUrl: './submit-panel.component.css'
})
export class SubmitPanelComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
