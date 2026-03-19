import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { ExamQuestion } from "../../../../../common/so-wrappers";
import { NgClass } from "@angular/common";

@Component({
  selector: 'question-palette',
  imports: [
    NgClass
  ],
  templateUrl: './question-palette.component.html',
  styleUrl: './question-palette.component.css'
})
export class QuestionPaletteComponent {

  examSvc = inject( JeeMainService ) ;

  protected displayQuestion( q: ExamQuestion ) {
    this.examSvc.activateQuestion( q ) ;
  }

  protected getNumNotVisitedQuestions() {
    return this.examSvc.getNumQuestions( "NOT_VISITED" ) ;
  }

  protected getNumNotAnsweredQuestions() {
    return this.examSvc.getNumQuestions( "NOT_ANSWERED" ) ;
  }

  protected getNumAnsweredQuestions() {
    return this.examSvc.getNumQuestions( "ANSWERED" ) ;
  }

  protected getNumMarkedForReviewQuestions() {
    return this.examSvc.getNumQuestions( "MARKED_FOR_REVIEW" ) ;
  }

  protected getNumAnsweredAndMarkedForReviewQuestions() {
    return this.examSvc.getNumQuestions( "ANS_AND_MARKED_FOR_REVIEW" ) ;
  }

  getQuestionStatusClass( question: ExamQuestion ) {
    switch( question.state ) {
      case "NOT_VISITED" : return "q-not-visited" ;
      case "NOT_ANSWERED" : return "q-not-answered" ;
      case "ANSWERED" : return "q-answered" ;
      case "MARKED_FOR_REVIEW": return "q-marked-for-review" ;
      case "ANS_AND_MARKED_FOR_REVIEW" : return "q-ans-marked-for-review" ;
    }
    return "q-not-visited" ;
  }
}
