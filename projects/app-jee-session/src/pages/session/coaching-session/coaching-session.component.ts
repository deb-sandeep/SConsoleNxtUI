import { Component, inject } from '@angular/core';
import { Session } from "../../../entities/session";
import { SessionTimerComponent } from "../widgets/session-timer/session-timer.component";
import { SessionHeaderComponent } from "../widgets/session-header/session-header.component";
import { SessionStateService } from "../../../service/session-state.service";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { ProblemPickerComponent } from "../widgets/problem-picker/problem-picker.component";
import { ProblemAttemptComponent } from "../widgets/problem-attempt/problem-attempt.component";
import { PauseScreenComponent } from "../widgets/pause-screen/pause-screen.component";

@Component({
  selector: 'theory-session',
  imports: [
    SessionTimerComponent,
    SessionHeaderComponent,
    ActionButtonComponent,
    NgIf,
    ProblemPickerComponent,
    ProblemAttemptComponent,
    PauseScreenComponent
  ],
  templateUrl: "./coaching-session.component.html",
})
export class CoachingSessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  showProblemPicker = false;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.session.start()
          .then( () => this.session.fetchPigeons() ) ;
    }
  }

  exitSession() {
    this.session.end()
        .then( ()=> this.router.navigate(['../landing']) )
        .then() ;
  }
}
