import { Component, inject } from '@angular/core';
import { Router } from "@angular/router";
import { SessionStateService } from "../../../service/session-state.service";
import { Session } from "../../../entities/session";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { NgIf } from "@angular/common";
import { PauseScreenComponent } from "../widgets/pause-screen/pause-screen.component";
import { ProblemAttemptComponent } from "../widgets/problem-attempt/problem-attempt.component";
import { ProblemPickerComponent } from "../widgets/problem-picker/problem-picker.component";
import { SessionHeaderComponent } from "../widgets/session-header/session-header.component";
import { SessionTimerComponent } from "../widgets/session-timer/session-timer.component";

@Component({
  selector: 'exercise-session',
  imports: [
    ActionButtonComponent,
    NgIf,
    PauseScreenComponent,
    ProblemAttemptComponent,
    ProblemPickerComponent,
    SessionHeaderComponent,
    SessionTimerComponent
  ],
  templateUrl: './exercise-session.component.html',
})
export class ExerciseSessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  showProblemPicker = false ;
  autoPlayState = true ;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.session.start()
          .then( () => {
            this.session.fetchActiveProblems()
                .then( () => this.showProblemPicker = true ) ;
          } ) ;
    }
  }

  exitSession() {
    this.session.end()
        .then( ()=> this.router.navigate(['../landing']) )
        .then() ;
  }

  autoPlayChanged( value:boolean ) {
    this.autoPlayState = value ;
  }
}
