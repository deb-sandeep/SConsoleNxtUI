import { Component, inject } from '@angular/core';
import { Session } from "../../../service/session";
import { TimerComponent } from "../widgets/timer/timer.component";
import { HeaderComponent } from "../widgets/header/header.component";
import { SessionStateService } from "../../../service/session-state.service";
import { ActionButtonComponent } from "../widgets/action-button/action-button.component";
import { Router } from "@angular/router";

@Component({
  selector: 'non-exercise-session',
  imports: [
    TimerComponent,
    HeaderComponent,
    ActionButtonComponent
  ],
  template: `
    <div id="ne-session-container">
      <session-header></session-header>
      <session-timer></session-timer>
      <div class="action-btn-panel">
        <action-btn (click)="exitSession()"
                    [bgColor]="'#3e0000'"
                    [color]="'#858585'">
          <span class="bi-box-arrow-right" style="font-size:45px;"></span>
        </action-btn>
      </div>
    </div>
  `,
})
export class NonExerciseSessionComponent {

  router = inject( Router ) ;
  stateSvc = inject( SessionStateService ) ;
  session: Session;

  constructor() {
    if( this.stateSvc.session.topic() == null ) {
      this.router.navigate(['../landing']).then();
    }
    else {
      this.session = this.stateSvc.session ;
      this.stateSvc.startNewSession().then() ;
    }
  }

  exitSession() {
    this.router.navigate(['../landing']).then() ;
  }
}
