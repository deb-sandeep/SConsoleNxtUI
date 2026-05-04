import { Component, Input, output, ViewChild } from '@angular/core';
import { ExamAttemptSO, ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { SectionEvalComponent } from "@jee-common/widgets/exam-eval-display/section-eval/section-eval.component";
import { QuestionEvalComponent } from "@jee-common/widgets/exam-eval-display/question-eval/question-eval.component";
import {
  QuestionDisplayComponent
} from "@jee-common/widgets/exam-eval-display/question-display/question-display.component";
import { TimeSequenceComponent } from "@jee-common/widgets/exam-eval-display/time-sequence/time-sequence.component";
import { NgClass, NgIf } from "@angular/common";
import {
  AttemptLapAnalysisComponent
} from "@jee-common/widgets/exam-eval-display/attempt-lap-analysis/attempt-lap-analysis.component";

@Component({
  selector: 'exam-eval-display',
  imports: [
    SectionEvalComponent,
    QuestionEvalComponent,
    QuestionDisplayComponent,
    TimeSequenceComponent,
    NgIf,
    NgClass,
    AttemptLapAnalysisComponent
  ],
  templateUrl: './exam-eval-display.component.html',
  styleUrl: './exam-eval-display.component.css'
})
export class ExamEvalDisplayComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  @Input()
  displayQAttemptLapAnalysis : boolean = false ;

  onClose = output() ;

  @ViewChild( QuestionDisplayComponent )
  questionDisplay: QuestionDisplayComponent ;

  @ViewChild( QuestionEvalComponent )
  questionEvalComponent: QuestionEvalComponent ;

  @ViewChild( TimeSequenceComponent )
  timeSequenceComponent: TimeSequenceComponent ;

  @ViewChild( AttemptLapAnalysisComponent )
  attemptLapAnalysisComponent : AttemptLapAnalysisComponent ;

  protected attemptSelectedInQuestionEvalPanel( $event: ExamQuestionAttemptSO ) {
    this.attemptLapAnalysisComponent.setQuestionAttempt( $event ) ;
    this.questionDisplay.setQuestionAttempt( $event ) ;
    this.timeSequenceComponent.selectQuestionAttempt( $event ) ;
  }

  protected attemptSelectedInTimeSequencePanel( $event: ExamQuestionAttemptSO ) {
    this.attemptLapAnalysisComponent.setQuestionAttempt( $event ) ;
    this.questionDisplay.setQuestionAttempt( $event ) ;
    this.questionEvalComponent.selectQuestionAttempt( $event ) ;
  }
}
