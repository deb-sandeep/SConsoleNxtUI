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

  private numTicks = 0 ;

  private timeoutRef:ReturnType<typeof setTimeout>|null = null ;

  constructor() {
    this.timeoutRef = setTimeout(() => this.tick(), 1000 ) ;
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

    this.timeoutRef = setTimeout(() => this.tick(), 1000 ) ;
  }

  pause(): void {
    this.stateSvc
        .startPause()
        .then( () => this.paused  = true ) ;
  }

  resume(): void {
    this.stateSvc
      .endPause()
      .then( () => {
        this.paused = false ;
        this.numPauseSeconds = 0 ;
      }) ;
  }

  stop(): void {
    if( this.timeoutRef != null ) {
      clearTimeout( this.timeoutRef ) ;
    }
    this.paused = false ;
    this.numTicks = 0 ;
    this.numActiveSeconds = 0 ;
    this.numPauseSeconds = 0 ;
    this.timeoutRef = null ;
  }

  ngOnDestroy(): void {
    stop() ;
  }

  getTimerClass() {
    return this.stateSvc.session.isInProblemAttemptMode() ? 'timer-small' : 'timer-big' ;
  }
}
