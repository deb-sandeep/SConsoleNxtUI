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

  question : ExamQuestionAttemptSO ;

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.question.examQuestion.question.sourceId }/${ img.fileName }` ;
  }

  protected questionRatingChanged() {
    this.apiSvc.updateQuestionRating( this.question.examQuestion.question.id,
                                      this.question.examQuestion.question.rating ).then() ;
  }
}
