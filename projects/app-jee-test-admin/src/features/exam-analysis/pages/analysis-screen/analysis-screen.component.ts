import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamEvalDisplayComponent } from "@jee-common/widgets/exam-eval-display/exam-eval-display.component";
import { ExamApiService } from "@jee-common/services/exam-api.service";
import { ExamAttemptSO } from "@jee-common/util/exam-data-types";

@Component({
  selector: 'analysis-screen',
  imports: [
    ExamEvalDisplayComponent
  ],
  templateUrl: './analysis-screen.component.html',
  styleUrl: './analysis-screen.component.css'
})
export class AnalysisScreenComponent {

  apiSvc = inject( ExamApiService ) ;
  router = inject( Router ) ;
  route = inject( ActivatedRoute ) ;

  eval: ExamAttemptSO ;

  ngOnInit() {
    this.route.paramMap.subscribe( pm => {
      const examAttemptId = Number( pm.get( 'examAttemptId' ) ) ;
      if( !isNaN( examAttemptId ) ){
        this.apiSvc.fetchExamAttempt( examAttemptId )
          .then( res => {
            console.log(res);
            this.eval = res ;
          }) ;
      }
    })
  }

  protected closeResultScreen() {
    console.log('closeResultScreen');
    this.router.navigate( [ '../../attempt-listing' ], {relativeTo : this.route} ).then() ;
  }
}
