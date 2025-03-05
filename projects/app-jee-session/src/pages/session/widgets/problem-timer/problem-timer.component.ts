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

  constructor() {}

  start() {
    this.stop() ;
  }

  pause(): void {
  }

  resume(): void {
  }

  stop(): void {
    this.paused = false ;
    this.numActiveSeconds = 0 ;
    this.numPauseSeconds = 0 ;
  }

  ngOnDestroy(): void {
    stop() ;
  }
}
