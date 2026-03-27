import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExamEvalDisplayComponent } from "@jee-common/components/exam-eval-display/exam-eval-display.component";
import { JeeMainService } from "../../jee-main.service";

@Component({
  selector: 'result-screen',
  imports: [
    ExamEvalDisplayComponent
  ],
  templateUrl: './result-screen.component.html',
  styleUrl: './result-screen.component.css'
})
export class ResultScreenComponent {

  examSvc = inject( JeeMainService ) ;
  router = inject( Router );

  protected closeResultScreen() {
    this.router.navigate( [ '/exam-listing' ] ).then() ;
  }
}
