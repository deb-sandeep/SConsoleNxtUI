import { Component, inject, input } from '@angular/core';
import { ExamQuestionAttemptSO, QuestionImageSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { ExamApiService } from "../../../../../app-jee-exam/src/services/exam-api.service";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";

@Component( {
  selector: 'div[questionDisplay]',
  templateUrl: './question-display.component.html',
  imports: [
    NgbRating
  ],
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  apiSvc = inject( ExamApiService ) ;

  questionAttempt : ExamQuestionAttemptSO ;

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.questionAttempt.examQuestion.question.sourceId }/${ img.fileName }` ;
  }

  protected questionRatingChanged() {
    this.apiSvc.updateQuestionRating( this.questionAttempt.examQuestion.question.id,
                                      this.questionAttempt.examQuestion.question.rating ).then() ;
  }

  protected isEligibleForMarkOverride() {
    return this.questionAttempt.evaluationStatus === "UNANSWERED" ||
           this.questionAttempt.evaluationStatus === "INCORRECT" ;
  }

  protected getMinMarks() {
    const problemType = this.questionAttempt.examQuestion.question.problemType ;
    if( problemType == "MCA" ) {
      return -2 ;
    }
    else if( problemType == "SCA" ) {
      return -1 ;
    }
    return 0 ;
  }

  protected getMaxMarks() {
  }
}
