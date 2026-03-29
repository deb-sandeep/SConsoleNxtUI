import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { ExamSection } from "../../../../../common/so-wrappers";
import { EventLogService } from "@jee-common/services/event-log.service";

@Component({
  selector: 'section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css'
})
export class SectionHeaderComponent {

  examSvc = inject( JeeMainService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected jumpToSection( section: ExamSection ) {
    this.eventLogSvc.logJumpSection( section ) ;
    this.examSvc.activateQuestion( section.firstQuestion ) ;
  }
}
