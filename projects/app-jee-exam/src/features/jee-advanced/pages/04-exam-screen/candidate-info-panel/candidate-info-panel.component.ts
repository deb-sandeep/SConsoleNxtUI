import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'candidate-info-panel',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './candidate-info-panel.component.html',
  styleUrl: './candidate-info-panel.component.css'
})
export class CandidateInfoPanelComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
