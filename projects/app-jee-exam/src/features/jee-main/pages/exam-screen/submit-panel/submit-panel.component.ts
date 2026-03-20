import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { EventLogService } from "../../../../../services/event-log.service";

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
}
