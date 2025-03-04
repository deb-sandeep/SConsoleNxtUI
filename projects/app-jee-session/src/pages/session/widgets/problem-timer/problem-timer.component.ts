import { Component, inject, OnDestroy } from '@angular/core';
import { NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";
import { DurationPipe } from "../../../../pipes/duration.pipe";

@Component({
  selector: 'problem-timer',
  imports: [
    NgIf,
    DurationPipe
  ],
  templateUrl: './problem-timer.component.html',
  styleUrl: './problem-timer.component.css'
})
export class ProblemTimerComponent implements OnDestroy {

  protected stateSvc = inject( SessionStateService ) ;

  protected numActiveSeconds = 0 ;
  protected numPauseSeconds = 0 ;

  protected paused = false ;

  private timeoutRef:ReturnType<typeof setTimeout>|null = null ;

  constructor() {}

  start() {
    this.stop() ;
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
    this.numActiveSeconds = 0 ;
    this.numPauseSeconds = 0 ;
    this.timeoutRef = null ;
  }

  ngOnDestroy(): void {
    stop() ;
  }

  private tick(): void {
    if( this.paused ) {
      this.numPauseSeconds++ ;
    }
    else {
      this.numActiveSeconds++ ;
    }
    this.timeoutRef = setTimeout(() => this.tick(), 1000 ) ;
  }
}
