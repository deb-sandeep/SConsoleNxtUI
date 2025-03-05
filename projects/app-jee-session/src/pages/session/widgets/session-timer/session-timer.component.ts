import { Component, inject } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";
import { Session } from "../../../../service/session";
import { PauseScreenComponent } from "../pause-screen/pause-screen.component";

@Component({
  selector: 'session-timer',
  imports: [
    NgIf,
    NgClass,
    DurationPipe,
    PauseScreenComponent
  ],
  styleUrl: './session-timer.component.css',
  template: `
    <div [ngClass]="getTimerClass()"
         (click)="session.pause()">
      {{session.effectiveDuration() | duration}}
    </div>
    <pause-screen *ngIf="session.isPaused()">
    </pause-screen>
  `,
})
export class SessionTimerComponent {

  private stateSvc = inject( SessionStateService ) ;
  protected session:Session = this.stateSvc.session ;

  getTimerClass() {
    return this.stateSvc.session.isInProblemAttemptMode() ? 'timer-small' : 'timer-big' ;
  }
}
