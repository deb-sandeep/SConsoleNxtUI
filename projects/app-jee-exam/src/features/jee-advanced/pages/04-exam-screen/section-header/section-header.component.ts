import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { ExamSection } from "../../../../../common/so-wrappers";

@Component({
  selector: 'section-header',
  imports: [],
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.css'
})
export class SectionHeaderComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  @ViewChild( 'tabsList' )
  private tabsList?: ElementRef<HTMLDivElement> ;

  protected scrollTabs( direction: number ) {
    const el = this.tabsList?.nativeElement ;
    if( el ) {
      el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' }) ;
    }
  }
}
