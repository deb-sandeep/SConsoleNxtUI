import { Component, inject } from '@angular/core';
import { NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";
import { Session } from "../../../../entities/session";
import { PauseScreenComponent } from "../pause-screen/pause-screen.component";

@Component({
  selector: 'session-timer',
  imports: [
    NgIf,
    DurationPipe,
    PauseScreenComponent
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
