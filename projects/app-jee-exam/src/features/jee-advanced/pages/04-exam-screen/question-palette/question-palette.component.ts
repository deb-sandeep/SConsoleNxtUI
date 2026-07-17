import { Component, inject } from '@angular/core';
import { SubmitPanelComponent } from "../submit-panel/submit-panel.component";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

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
}
