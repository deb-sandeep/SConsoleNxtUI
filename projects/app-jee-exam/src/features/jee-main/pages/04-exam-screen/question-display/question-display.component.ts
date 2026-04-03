import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";
import { NgOptimizedImage } from "@angular/common";
import { QuestionImageSO, QuestionSO } from "@jee-common/util/exam-data-types";
import { environment } from "@env/environment";
import { ExamQuestion } from "../../../../../common/so-wrappers";
import { EventLogService } from "@jee-common/services/event-log.service";
import { SCAAnswerZoneComponent } from "./sca-answer-zone/sca-answer-zone.component";
import { NVTAnswerZoneComponent } from "./nvt-answer-zone/nvt-answer-zone.component";

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
  }
}
