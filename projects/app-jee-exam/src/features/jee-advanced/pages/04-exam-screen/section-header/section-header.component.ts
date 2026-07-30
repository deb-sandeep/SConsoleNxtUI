import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { ExamSection } from "../../../../../common/so-wrappers";
import { SectionSnapshotInfoComponent } from "../section-snapshot-info/section-snapshot-info.component";

@Component({
  selector: 'section-header',
  imports: [ SectionSnapshotInfoComponent ],
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

  protected get canScrollLeft(): boolean {
    const el = this.tabsList?.nativeElement ;
    return !!el && el.scrollLeft > 0 ;
  }

  protected get canScrollRight(): boolean {
    const el = this.tabsList?.nativeElement ;
    return !!el && el.scrollLeft + el.clientWidth < el.scrollWidth - 1 ;
  }

  // Empty handlers: their only purpose is to run change detection (native scroll/resize
  // events aren't otherwise tied to a zone task), so canScrollLeft/canScrollRight above
  // get re-evaluated and the nav buttons' disabled state stays in sync.
  protected onTabsScroll() {}

  @HostListener( 'window:resize' )
  protected onWindowResize() {}
}
