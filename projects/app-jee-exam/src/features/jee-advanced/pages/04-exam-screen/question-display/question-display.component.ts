import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { NgOptimizedImage } from "@angular/common";
import { JeeAdvancedService } from "../../../jee-advanced.service";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { EventLogService } from "@jee-common/services/event-log.service";
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { ExamQuestion } from "../../../../../common/so-wrappers";
import { SCAAnswerZoneComponent } from "./sca-answer-zone/sca-answer-zone.component";
import { NVTAnswerZoneComponent } from "./nvt-answer-zone/nvt-answer-zone.component";
import { MCAAnswerZoneComponent } from "./mca-answer-zone/mca-answer-zone.component";

@Component({
  selector: 'question-display',
  imports: [
    NgOptimizedImage,
    SCAAnswerZoneComponent,
    NVTAnswerZoneComponent,
    MCAAnswerZoneComponent
  ],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {

  @ViewChild('questionDisplayContainer')
  private questionDisplayContainer?: ElementRef<HTMLDivElement>;

  protected readonly Math = Math ;

  examSvc = inject( JeeAdvancedService ) ;
  apiSvc = inject( ExamApiService ) ;
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

  protected getSectionQuestionNumber( question: ExamQuestion ): number {
    return ( this.examSvc.activeSection?.questions.indexOf( question ) ?? -1 ) + 1 ;
  }

  protected getQuestionTypeLabel( problemType: string ): string {
    switch( problemType ) {
      case "SCA": return "MCQ" ;
      case "MCA": return "MSQ" ;
      case "NVT": return "NVT" ;
      case "IVT": return "NVT" ;
      case "MMT": return "MM" ;
      case "CMT": return "MM" ;
      case "ART": return "MCQ" ;
    }
    return problemType ;
  }
}
