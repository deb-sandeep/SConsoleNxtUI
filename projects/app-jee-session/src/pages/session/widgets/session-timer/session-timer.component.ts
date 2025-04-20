import { Component, inject } from '@angular/core';
import { DurationPipe } from "lib-core";
import { SessionStateService } from "../../../../service/session-state.service";
import { Session } from "../../../../entities/session";

@Component({
  selector: 'session-timer',
  imports: [
    DurationPipe,
  ],
  styleUrl: './session-timer.component.css',
  template: `
    <div class="session-timer-big"
         (click)="session.pause()">
      {{session.effectiveDuration() | duration}}
    </div>
  `,
})
export class SessionTimerComponent {

  private stateSvc = inject( SessionStateService ) ;
  protected session:Session = this.stateSvc.session ;
}
