import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";

@Component({
  selector: 'question-action-panel',
  imports: [],
  templateUrl: './question-action-panel.component.html',
  styleUrl: './question-action-panel.component.css'
})
export class QuestionActionPanelComponent {

  examSvc = inject( JeeMainService ) ;
  apiSvc = inject( ExamApiService ) ;
  eventLogSvc = inject( EventLogService ) ;

  protected saveAndNext() {
    let activeQ = this.examSvc.activeQuestion ;
    if( this.answerExists() ) {
      activeQ.state = "ANSWERED" ;
      this.apiSvc.saveAnswerAction( activeQ, "ANSWERED", this.examSvc.currentLap ).then() ;
      this.eventLogSvc.logAnswerAction( activeQ, "SAVE_&_NEXT" ) ;
      this.activateNextQuestion() ;
    }
  }

  protected saveAndMarkForReview() {
    let activeQ = this.examSvc.activeQuestion ;
    if( this.answerExists() ) {
      activeQ.state = "ANS_AND_MARKED_FOR_REVIEW" ;
      this.apiSvc.saveAnswerAction( activeQ, "ANS_AND_MARKED_FOR_REVIEW", this.examSvc.currentLap ).then() ;
      this.eventLogSvc.logAnswerAction( activeQ, "SAVE_&_MARK_REVIEW" ) ;
      this.activateNextQuestion() ;
    }
  }

  protected clearResponse() {
    let activeQ = this.examSvc.activeQuestion ;
    this.examSvc.activeQuestion.answer = null ;
    this.examSvc.activeQuestion.state = "NOT_ANSWERED" ;
    this.apiSvc.saveAnswerAction( activeQ, "NOT_ANSWERED", this.examSvc.currentLap ).then() ;
    this.eventLogSvc.logAnswerAction( activeQ, "CLEAR_RESPONSE" ) ;
  }

  protected markForReviewAndNext() {
    let activeQ = this.examSvc.activeQuestion ;
    activeQ.state = "MARKED_FOR_REVIEW" ;
    this.apiSvc.saveAnswerAction( activeQ, "MARKED_FOR_REVIEW", this.examSvc.currentLap ).then() ;
    this.eventLogSvc.logAnswerAction( activeQ, "MARK_REVIEW_&_NEXT" ) ;
    this.activateNextQuestion() ;
  }

  private answerExists() {
    let answer = this.examSvc.activeQuestion.answer ;
    if( answer == null ) {
      const problemType = this.examSvc.activeQuestion.questionConfig.question.problemType ;
      alert( problemType === "NVT" ? "Please enter an answer" : "Please choose an option" ) ;
      return false ;
    }
    return true ;
  }

  private activateNextQuestion() {
    let nextQ = this.examSvc.activeQuestion.nextQuestion ;
    if( nextQ != null ) {
      this.examSvc.activateQuestion( nextQ ) ;
    }
  }
}
