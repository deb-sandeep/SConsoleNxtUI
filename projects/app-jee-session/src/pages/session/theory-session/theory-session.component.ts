import { Component, inject, ViewChild } from '@angular/core';
import { Session } from "../../../service/session";
import { SessionTimerComponent } from "../widgets/session-timer/session-timer.component";
import { HeaderComponent } from "../widgets/header/header.component";
import { SessionStateService } from "../../../service/session-state.service";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { Router } from "@angular/router";

@Component({
  selector: 'theory-session',
  imports: [
    SessionTimerComponent,
    HeaderComponent,
    ActionButtonComponent
  ],
  template: `
    <div id="session-screen">
      <session-header></session-header>
      <session-timer #timer></session-timer>
      <div class="action-btn-panel">
        <action-btn (click)="exitSession()"
                    [bgColor]="'#200000'"
                    [color]="'#858585'">
          <span class="bi-box-arrow-right" style="font-size:45px;"></span>
        </action-btn>
      </div>
    </div>
  `,
})
export class TheorySessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  @ViewChild( "timer" ) timer : SessionTimerComponent ;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.stateSvc.startSession().then() ;
    }
  }

  exitSession() {
    this.timer.stop() ;
    this.stateSvc.endSession()
        .then( ()=> this.router.navigate(['../landing']) )
        .then() ;
  }
}
