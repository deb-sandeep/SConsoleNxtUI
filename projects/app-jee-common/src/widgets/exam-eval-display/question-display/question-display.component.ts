import { Component, inject, Input } from '@angular/core';
import { ExamAttemptSO, ExamQuestionAttemptSO, QuestionImageSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { NgbRating } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";

@Component( {
  selector: 'div[questionDisplay]',
  templateUrl: './question-display.component.html',
  imports: [
    NgbRating,
    FormsModule
  ],
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  @Input()
  eval: ExamAttemptSO ;

  examSvc = inject( JeeBaseService ) ;
  apiSvc = inject( ExamApiService ) ;

  questionAttempt : ExamQuestionAttemptSO ;
  updatedScore : number = 0 ;

  setQuestionAttempt( attempt: ExamQuestionAttemptSO ) {
    this.questionAttempt = attempt ;
    this.updatedScore = this.questionAttempt.score ;
  }

  getImgURL( img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ this.questionAttempt.examQuestion.question.sourceId }/${ img.fileName }` ;
  }

  protected questionRatingChanged() {
    this.apiSvc.updateQuestionRating( this.questionAttempt.examQuestion.question.id,
                                      this.questionAttempt.examQuestion.question.rating ).then() ;
  }

  protected isEligibleForMarkOverride() {
    return this.questionAttempt.evaluationStatus != "CORRECT" ;
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
    const sectionId = this.questionAttempt.examQuestion.sectionId ;
    const sectionAttempt = this.eval?.sectionAttempts.find(
      attempt => attempt.examSection.id === sectionId
    ) ;

    return sectionAttempt?.examSection.correctMarks ?? 0 ;
  }

  protected overrideScore() {
    this.examSvc.overrideScore( this.questionAttempt, this.updatedScore ) ;
  }
}
