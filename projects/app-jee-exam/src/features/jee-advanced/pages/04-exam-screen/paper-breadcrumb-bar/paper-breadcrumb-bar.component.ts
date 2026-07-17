import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'paper-breadcrumb-bar',
  imports: [],
  templateUrl: './paper-breadcrumb-bar.component.html',
  styleUrl: './paper-breadcrumb-bar.component.css'
})
export class PaperBreadcrumbBarComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;
}
