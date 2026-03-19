import { Component, inject } from '@angular/core';
import { JeeMainService } from "../../../jee-main.service";

@Component({
  selector: 'submit-panel',
  imports: [],
  templateUrl: './submit-panel.component.html',
  styleUrl: './submit-panel.component.css'
})
export class SubmitPanelComponent {

  examSvc = inject( JeeMainService ) ;

  protected prevQuestionExists() {
    return this.examSvc.activeQuestion?.prevQuestion != null ;
  }

  protected nextQuestionExists() {
    return this.examSvc.activeQuestion?.nextQuestion != null ;
  }

  protected showPrevQuestion() {
    this.examSvc.activateQuestion( this.examSvc.activeQuestion.prevQuestion! ) ;
  }

  protected showNextQuestion() {
    this.examSvc.activateQuestion( this.examSvc.activeQuestion.nextQuestion! ) ;
  }
}
