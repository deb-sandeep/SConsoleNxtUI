import { Component, inject } from '@angular/core';
import { ExamQuestionAttemptSO } from "@jee-common/util/exam-data-types";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { JeeBaseService } from "@jee-common/services/jee-base.service";

@Component({
  selector: 'div[qAttemptLapAnalysis]',
  imports: [],
  templateUrl: './attempt-lap-analysis.component.html',
  styleUrl: './attempt-lap-analysis.component.css'
})
export class AttemptLapAnalysisComponent {

  apiSvc = inject( ExamApiService ) ;
  examSvc = inject( JeeBaseService ) ;

  questionAttempt : ExamQuestionAttemptSO ;

  setQuestionAttempt( attempt: ExamQuestionAttemptSO ) {
    this.questionAttempt = attempt ;
  }
}
