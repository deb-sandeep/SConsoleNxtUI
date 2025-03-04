import { Component, inject, OnDestroy } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";

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
export class SessionTimerComponent implements OnDestroy {

  private stateSvc = inject( SessionStateService ) ;

  protected numActiveSeconds = 0 ;
  protected numPauseSeconds = 0 ;

  protected paused = false ;

  private killSwitch = false ;
  private numTicks = 0 ;

  constructor() {
    setTimeout(() => this.tick(), 1000 ) ;
  }

  private tick(): void {
    this.numTicks++;

    if( this.paused ) {
      this.numPauseSeconds++ ;
    }
    else {
      this.numActiveSeconds++ ;
    }

    let updateServer = this.numTicks % 5 == 0 ;
    this.stateSvc.updateContinuationTime( updateServer ) ;

    if( !this.killSwitch ) {
      setTimeout(() => this.tick(), 1000 ) ;
    }
  }

  pauseTimer(): void {
    this.stateSvc
        .startPause()
        .then( () => this.paused  = true ) ;
  }

  resumeTimer(): void {
    this.stateSvc
      .endPause()
      .then( () => {
        this.paused = false ;
        this.numPauseSeconds = 0 ;
      }) ;
  }

  stop(): void {
    this.killSwitch = true ;
  }

  ngOnDestroy(): void {
    stop() ;
  }

  getTimerClass() {
    return this.stateSvc.session.isInProblemAttemptMode() ? 'timer-small' : 'timer-big' ;
  }
}
