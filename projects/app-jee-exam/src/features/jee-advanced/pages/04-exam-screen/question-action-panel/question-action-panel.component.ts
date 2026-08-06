import { Component, inject } from '@angular/core';
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { examConfig } from "../../../../../exam-config.js";

@Component({
  selector: 'question-action-panel',
  imports: [],
  templateUrl: './question-action-panel.component.html',
  styleUrl: './question-action-panel.component.css'
})
export class QuestionActionPanelComponent {

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected readonly examConfig = examConfig;

  protected saveAndNext() {
    const activeQ = this.examSvc.activeQuestion ;
    const status = this.isAnswerStaged() ? "ANSWERED" : "NOT_ANSWERED" ;
    activeQ.state = status ;
    this.apiSvc.saveAnswerAction( activeQ, status, this.examSvc.currentLap ).then() ;
    this.eventLogSvc.logAnswerAction( activeQ, "SAVE_&_NEXT" ) ;
    this.activateNextQuestion() ;
  }

  protected markForReviewAndNext() {
    const activeQ = this.examSvc.activeQuestion ;
    const status = this.isAnswerStaged() ? "ANS_AND_MARKED_FOR_REVIEW" : "MARKED_FOR_REVIEW" ;
    activeQ.state = status ;
    this.apiSvc.saveAnswerAction( activeQ, status, this.examSvc.currentLap ).then() ;
    this.eventLogSvc.logAnswerAction( activeQ, "MARK_REVIEW_&_NEXT" ) ;
    this.activateNextQuestion() ;
  }

  protected clearResponse() {
    const activeQ = this.examSvc.activeQuestion ;
    activeQ.answer = null ;
    activeQ.state = "NOT_ANSWERED" ;
    this.apiSvc.saveAnswerAction( activeQ, "NOT_ANSWERED", this.examSvc.currentLap ).then() ;
    this.eventLogSvc.logAnswerAction( activeQ, "CLEAR_RESPONSE" ) ;
  }

  protected previous() {
    const prevQ = this.examSvc.activeQuestion.prevQuestion ;
    if( prevQ != null ) {
      this.examSvc.activateQuestion( prevQ ) ;
    }
  }

  private isAnswerStaged(): boolean {
    return this.examSvc.activeQuestion.answer != null ;
  }

  private activateNextQuestion() {
    const activeQ = this.examSvc.activeQuestion ;
    const nextQ = activeQ.nextQuestion ?? this.examSvc.questions[0] ;
    this.examSvc.activateQuestion( nextQ ) ;
  }
}
