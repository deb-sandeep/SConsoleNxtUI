import { Component, Input, output } from '@angular/core';
import { ExamAttemptSO } from "@jee-common/util/exam-data-types";
import { SectionEvalComponent } from "@jee-common/components/exam-eval-display/section-eval/section-eval.component";

@Component({
  selector: 'exam-eval-display',
  imports: [
    SectionEvalComponent
  ],
  templateUrl: './exam-eval-display.component.html',
  styleUrl: './exam-eval-display.component.css'
})
export class ExamEvalDisplayComponent {

  @Input()
  eval: ExamAttemptSO | null = null ;

  onClose = output() ;
}
