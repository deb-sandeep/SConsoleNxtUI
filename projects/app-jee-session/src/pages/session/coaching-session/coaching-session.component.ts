import { Component, inject, ViewChild } from '@angular/core';
import { Session } from "../../../service/session";
import { SessionTimerComponent } from "../widgets/session-timer/session-timer.component";
import { HeaderComponent } from "../widgets/header/header.component";
import { SessionStateService } from "../../../service/session-state.service";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { ProblemPickerComponent } from "../widgets/problem-picker/problem-picker.component";
import { TopicProblemSO } from "@jee-common/master-data-types";

@Component({
  selector: 'theory-session',
  imports: [
    SessionTimerComponent,
    HeaderComponent,
    ActionButtonComponent,
    NgIf,
    ProblemPickerComponent
  ],
  templateUrl: "./coaching-session.component.html",
})
export class CoachingSessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  @ViewChild( "sessionTimer" ) sessionTimer : SessionTimerComponent ;

  showProblemPicker = false;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.stateSvc.startSession()
          .then( () => this.stateSvc.fetchPigeons() ) ;
    }
  }

  pigeonSelected( problem: TopicProblemSO ) {
    this.stateSvc.setProblemAttempt( problem ).then() ;
  }

  exitSession() {
    this.sessionTimer.stop() ;
    this.stateSvc.endSession()
        .then( ()=> this.router.navigate(['../landing']) )
        .then() ;
  }
}
