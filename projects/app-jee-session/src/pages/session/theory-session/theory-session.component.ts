import { Component, inject } from '@angular/core';
import { Session } from "../../../entities/session";
import { SessionTimerComponent } from "../widgets/session-timer/session-timer.component";
import { SessionHeaderComponent } from "../widgets/session-header/session-header.component";
import { SessionStateService } from "../../../service/session-state.service";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { PauseScreenComponent } from "../widgets/pause-screen/pause-screen.component";

@Component({
  selector: 'theory-session',
  imports: [
    SessionTimerComponent,
    SessionHeaderComponent,
    ActionButtonComponent,
    NgIf,
    PauseScreenComponent
  ],
  template: `
    <div id="session-screen">
      <session-header></session-header>
      <div class="session-body">
        <div class="session-body-content">
          <session-timer></session-timer>
        </div>
        <div class="action-btn-panel">
          <action-btn (click)="exitSession()"
                      [bgColor]="'#200000'"
                      [color]="'#858585'">
            <span class="bi-box-arrow-right" style="font-size:45px;"></span>
          </action-btn>
        </div>
      </div>
    </div>
    <pause-screen *ngIf="session.isPaused()">
    </pause-screen>
  `,
})
export class TheorySessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.session.start().then() ;
    }
  }

  exitSession() {
    this.session.end()
        .then( ()=> this.router.navigate(['../landing']) )
        .then() ;
  }
}
