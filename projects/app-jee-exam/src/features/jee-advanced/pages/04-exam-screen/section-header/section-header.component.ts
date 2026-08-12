import { afterNextRender, Component, ElementRef, HostListener, inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
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

  @ViewChildren( 'tabBtn' )
  private tabButtons?: QueryList<ElementRef<HTMLButtonElement>> ;

  // activeSection is a plain mutable field on JeeBaseService, not a signal,
  // so an effect() can't observe it - this compares against the last-seen
  // value on every change-detection cycle instead, to catch section changes
  // that happen as a side effect of question navigation (Save & Next, Mark
  // for Review & Next, palette clicks), not just direct tab clicks here.
  private lastActiveSection: ExamSection | null = null ;

  constructor() {
    // afterNextRender's (default) callback still runs synchronously within the
    // same application tick, before Angular's dev-mode checkNoChanges
    // verification pass - so writing canScrollRight/canScrollLeft there still
    // races checkNoChanges and throws NG0100. Deferring via setTimeout pushes
    // the write to a macrotask that runs strictly after the tick (and its
    // checkNoChanges pass) has completed.
    afterNextRender( () => setTimeout( () => this.updateScrollButtons() ) ) ;
  }

  protected selectSection( section: ExamSection ) {
    this.eventLogSvc.logJumpSection( section ) ;
    this.examSvc.activateSection( section ) ;
  }

  ngDoCheck() {
    const activeSection = this.examSvc.activeSection ;
    if( activeSection !== this.lastActiveSection && this.tabButtons ) {
      this.lastActiveSection = activeSection ;
      this.scrollActiveTabIntoView( activeSection ) ;
    }
  }

  private scrollActiveTabIntoView( activeSection: ExamSection | null ) {
    if( activeSection == null ) { return ; }
    const index = this.examSvc.sections.indexOf( activeSection ) ;
    const button = this.tabButtons?.get( index )?.nativeElement ;
    button?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }) ;
  }

  // NTA shows the remaining time as total minutes, not HH:MM:SS
  // (e.g. a 3 hour paper starts at 180:00).
  protected getRemainingTime(): string {
    const timeLeft = Math.max( 0, this.examSvc.timeLeftInSeconds() ) ;
    const minutes = Math.floor( timeLeft / 60 ) ;
    const seconds = timeLeft % 60 ;
    return `${ minutes }:${ seconds.toString().padStart( 2, '0' ) }` ;
  }

  protected scrollTabs( direction: number ) {
    const el = this.tabsList?.nativeElement ;
    if( el ) {
      el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' }) ;
    }
  }

  protected canScrollLeft = false ;
  protected canScrollRight = false ;

  private updateScrollButtons() {
    const el = this.tabsList?.nativeElement ;
    this.canScrollLeft = !!el && el.scrollLeft > 0 ;
    this.canScrollRight = !!el && el.scrollLeft + el.clientWidth < el.scrollWidth - 1 ;
  }

  protected onTabsScroll() {
    this.updateScrollButtons() ;
  }

  @HostListener( 'window:resize' )
  protected onWindowResize() {
    this.updateScrollButtons() ;
  }
}
