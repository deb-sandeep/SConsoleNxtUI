import { Component, inject } from '@angular/core';
import { NgStyle } from "@angular/common";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamSection } from "../../../../../common/so-wrappers";
import { ExamQuestionSubmitStatus } from "@jee-common/util/exam-data-types";

const POPUP_WIDTH = 300 ;

@Component({
  selector: 'section-snapshot-info',
  imports: [ NgStyle ],
  templateUrl: './section-snapshot-info.component.html',
  styleUrl: './section-snapshot-info.component.css'
})
export class SectionSnapshotInfoComponent {

  examSvc = inject( JeeAdvancedService ) ;

  protected readonly rows: { state: ExamQuestionSubmitStatus, cssClass: string, label: string }[] = [
    { state: "ANSWERED",                  cssClass: "answered",        label: "Answered" },
    { state: "NOT_ANSWERED",              cssClass: "not-answered",    label: "Not Answered" },
    { state: "NOT_VISITED",               cssClass: "not-visited",     label: "Not Visited" },
    { state: "MARKED_FOR_REVIEW",         cssClass: "review",          label: "Marked for Review" },
    { state: "ANS_AND_MARKED_FOR_REVIEW", cssClass: "review-answered", label: "Answered & Marked for..." },
  ] ;

  protected visible = false ;
  protected section: ExamSection | null = null ;
  protected popupStyle: Record<string, string> = {} ;

  // A null section implies a paper level snapshot, aggregating across
  // all the sections.
  show( event: MouseEvent, section: ExamSection | null ) {

    this.section = section ;

    const rect = ( event.currentTarget as HTMLElement ).getBoundingClientRect() ;
    const left = Math.max( 8, Math.min( rect.left, window.innerWidth - POPUP_WIDTH - 8 ) ) ;

    this.popupStyle = {
      top : `${rect.bottom + 8}px`,
      left : `${left}px`,
    } ;
    this.visible = true ;
  }

  hide() {
    this.visible = false ;
  }

  protected get title(): string {
    return this.section ? this.section.sectionName : this.examSvc.getPaperTitle() ;
  }

  protected getCount( state: ExamQuestionSubmitStatus ): number {
    return this.section ? this.section.getNumQuestions( state )
                        : this.examSvc.getNumQuestions( state ) ;
  }
}
