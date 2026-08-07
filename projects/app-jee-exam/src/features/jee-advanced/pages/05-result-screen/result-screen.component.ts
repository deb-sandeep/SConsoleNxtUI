import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ExamEvalDisplayComponent } from "@jee-common/widgets/exam-eval-display/exam-eval-display.component";
import { JeeAdvancedService } from "../../jee-advanced.service";

@Component({
  selector: 'result-screen',
  imports: [
    ExamEvalDisplayComponent
  ],
  templateUrl: './result-screen.component.html',
  styleUrl: './result-screen.component.css'
})
export class ResultScreenComponent {

  examSvc = inject( JeeAdvancedService ) ;
  router = inject( Router );

  protected closeResultScreen() {
    this.router.navigate( [ '/exam-listing' ] ).then() ;
  }
}
