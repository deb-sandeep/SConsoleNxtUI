import { Component, Input } from '@angular/core';
import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { DurationPipe } from "lib-core";

@Component({
  selector: 'attempt-summary',
  imports: [
    DurationPipe
  ],
  templateUrl: './attempt-summary.component.html',
  styleUrl: './attempt-summary.component.css'
})
export class AttemptSummaryComponent {

  @Input()
  answer: string ;

  @Input()
  questionAttempt : ExamQuestionAttemptSO ;
}
