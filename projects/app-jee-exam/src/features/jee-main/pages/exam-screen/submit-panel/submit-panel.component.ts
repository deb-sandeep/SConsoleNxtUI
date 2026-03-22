import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { EventLogService } from "../../../../../services/event-log.service";
import { examConfig } from "../../../../../exam-config.js";

@Component({
  selector: 'submit-panel',
  imports: [],
  templateUrl: './submit-panel.component.html',
  styleUrl: './submit-panel.component.css'
})
export class SubmitPanelComponent {

  examSvc = inject( JeeMainService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected prevQuestionExists() {
    return this.examSvc.activeQuestion?.prevQuestion != null ;
  }

  protected nextQuestionExists() {
    return this.examSvc.activeQuestion?.nextQuestion != null ;
  }

  protected showPrevQuestion() {
    const activeQuestion = this.examSvc.activeQuestion ;
    this.eventLogSvc.logJumpPreviousQuestion( activeQuestion) ;
    this.examSvc.activateQuestion( activeQuestion.prevQuestion! ) ;
  }

  protected showNextQuestion() {
    const activeQuestion = this.examSvc.activeQuestion ;
    this.eventLogSvc.logJumpNextQuestion( activeQuestion) ;
    this.examSvc.activateQuestion( activeQuestion.nextQuestion! ) ;
  }

  protected getLapBtnLabel() {
    const SPAN_HTML = "&nbsp; <span class='bi-chevron-double-right'></span> &nbsp;" ;
    let nextLap = this.examSvc.getNextLapName() ;
    return this.examSvc.currentLap +
           (nextLap == null ? "" : SPAN_HTML + nextLap) ;
  }

  protected readonly examConfig = examConfig;
}
