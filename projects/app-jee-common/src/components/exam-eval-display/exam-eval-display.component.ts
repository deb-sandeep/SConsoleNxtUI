import { Component, Input, output, ViewChild } from '@angular/core';
import { ExamAttemptSO, ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { SectionEvalComponent } from "@jee-common/components/exam-eval-display/section-eval/section-eval.component";
import { QuestionEvalComponent } from "@jee-common/components/exam-eval-display/question-eval/question-eval.component";
import {
  QuestionDisplayComponent
} from "@jee-common/components/exam-eval-display/question-display/question-display.component";

@Component({
  selector: 'exam-eval-display',
  imports: [
    SectionEvalComponent,
    QuestionEvalComponent,
    QuestionDisplayComponent
  ],
  templateUrl: './exam-eval-display.component.html',
  styleUrl: './exam-eval-display.component.css'
})
export class ExamEvalDisplayComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  onClose = output() ;

  @ViewChild( QuestionDisplayComponent )
  questionDisplay: QuestionDisplayComponent ;

  protected showQuestion( $event: ExamQuestionAttemptSO ) {
    this.questionDisplay.question = $event ;
  }
}
