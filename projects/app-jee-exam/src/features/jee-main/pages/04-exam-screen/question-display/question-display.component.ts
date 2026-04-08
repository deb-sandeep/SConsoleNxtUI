import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { NgOptimizedImage } from "@angular/common";
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { ExamQuestion } from "../../../../../common/so-wrappers";
import { EventLogService } from "@jee-common/services/event-log.service";
import { SCAAnswerZoneComponent } from "./sca-answer-zone/sca-answer-zone.component";
import { NVTAnswerZoneComponent } from "./nvt-answer-zone/nvt-answer-zone.component";
import { ExamApiService } from "@jee-common/services/exam-api.service";

@Component({
  selector: 'question-display',
    imports: [
        NgOptimizedImage,
        SCAAnswerZoneComponent,
        NVTAnswerZoneComponent
    ],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  @ViewChild('questionDisplayContainer')
  private questionDisplayContainer?: ElementRef<HTMLDivElement>;

  apiSvc = inject( ExamApiService ) ;
  examSvc = inject( JeeMainService ) ;
  eventLogSvc = inject( EventLogService ) ;

  getImgURL( question: QuestionSO, img:QuestionImageSO ) {
    return `${ environment.apiRoot }/question-img/${ question.sourceId }/${ img.fileName }` ;
  }

  protected scrollUp() {
    this.eventLogSvc.logScrollQuestion( this.examSvc.activeQuestion, 'UP' ) ;
    this.questionDisplayContainer?.nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  protected scrollDown() {
    this.eventLogSvc.logScrollQuestion( this.examSvc.activeQuestion, 'DOWN' ) ;
    const container = this.questionDisplayContainer?.nativeElement;
    if (!container) { return; }
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }

  protected answerEntered( question: ExamQuestion ) {
    this.eventLogSvc.logAnswerEntered( question ) ;
    const currentState = question.state ;

    // If the question is already answered and the user is changing the answer,
    // the state of the answer needs to be downgraded to give the student to
    // submit the answer again
    if( currentState === "ANSWERED" ) {
      question.state = "NOT_ANSWERED" ;
      this.apiSvc.saveAnswerAction( question, "NOT_ANSWERED", this.examSvc.currentLap ).then() ;
    }
    else if( question.state === "ANS_AND_MARKED_FOR_REVIEW" ) {
      question.state = "MARKED_FOR_REVIEW" ;
      this.apiSvc.saveAnswerAction( question, "MARKED_FOR_REVIEW", this.examSvc.currentLap ).then() ;
    }
  }
}
