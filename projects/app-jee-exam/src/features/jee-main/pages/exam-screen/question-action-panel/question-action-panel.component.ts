import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";

@Component({
  selector: 'question-action-panel',
  imports: [],
  templateUrl: './question-action-panel.component.html',
  styleUrl: './question-action-panel.component.css'
})
export class QuestionActionPanelComponent {

  examSvc = inject( JeeMainService ) ;

  protected saveAndNext() {
    let activeQ = this.examSvc.activeQuestion ;
    if( this.answerExists() ) {
      activeQ.state = "ANSWERED" ;
      this.activateNextQuestion() ;
    }
  }

  protected saveAndMarkForReview() {
    let activeQ = this.examSvc.activeQuestion ;
    if( this.answerExists() ) {
      activeQ.state = "ANS_AND_MARKED_FOR_REVIEW" ;
      this.activateNextQuestion() ;
    }
  }

  protected clearResponse() {
    this.examSvc.activeQuestion.state = "NOT_ANSWERED" ;
    this.examSvc.activeQuestion.answer = null ;
  }

  protected markForReviewAndNext() {
    let activeQ = this.examSvc.activeQuestion ;
    activeQ.state = "MARKED_FOR_REVIEW" ;
    this.activateNextQuestion() ;
  }

  private answerExists() {
    let answer = this.examSvc.activeQuestion.answer ;
    if( answer == null ) {
      alert( "Please choose an option" ) ;
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
