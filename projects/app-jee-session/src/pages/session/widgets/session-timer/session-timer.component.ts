import { Component, inject } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";
import { Session } from "../../../../service/session";

@Component({
  selector: 'session-timer',
  imports: [
    NgIf,
    NgClass,
    DurationPipe
  ],
  templateUrl: './session-timer.component.html',
  styleUrl: './session-timer.component.css'
})
export class SessionTimerComponent {

  private stateSvc = inject( SessionStateService ) ;

  protected session:Session ;
  protected numPauseSeconds = 0 ;
  protected paused = false ;

  constructor() {
    this.session = this.stateSvc.session ;
  }

  async pause() {
    await this.session.pause() ;
    this.paused = true ;
  }

  async resume() {
    await this.session.resume() ;
    this.paused = false ;
  }

  getTimerClass() {
    return this.stateSvc.session.isInProblemAttemptMode() ? 'timer-small' : 'timer-big' ;
  }
}
