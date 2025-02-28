import { Component, inject, OnDestroy } from '@angular/core';
import { NgIf } from "@angular/common";
import { SessionStateService } from "../../../../service/session-state.service";

@Component({
  selector: 'session-timer',
  imports: [
    NgIf
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent implements OnDestroy {

  private stateSvc = inject( SessionStateService ) ;

  private numActiveSeconds = 0 ;
  private numPauseSeconds = 0 ;

  protected paused = false ;
  private killSwitch = false ;

  constructor() {
    setTimeout(() => this.tick(), 1000 ) ;
  }

  private tick(): void {
    if( this.paused ) {
      this.numPauseSeconds++ ;
    }
    else {
      this.numActiveSeconds++ ;
    }

    this.stateSvc.updateContinuationTime() ;

    if( !this.killSwitch ) {
      setTimeout(() => this.tick(), 1000 ) ;
    }
  }

  private getDurationString( numSeconds:number ) {

    let hours   = Math.floor( numSeconds / 3600 ) ;
    let minutes = Math.floor( ( numSeconds - (hours * 3600) ) / 60 ) ;
    let seconds = numSeconds - ( hours * 3600 ) - ( minutes * 60 ) ;

    let hrStr, minStr, secStr ;

    hrStr  = ( hours   < 10 ) ? '0' + hours   : '' + hours ;
    minStr = ( minutes < 10 ) ? '0' + minutes : '' + minutes ;
    secStr = ( seconds < 10 ) ? '0' + seconds : '' + seconds ;

    return ((hours > 0)? hrStr + ':' : '') + minStr + ':' + secStr ;
  }

  getActiveDurationDisplay() {
    return this.getDurationString( this.numActiveSeconds ) ;
  }

  getPauseDurationDisplay() {
    return this.getDurationString( this.numPauseSeconds ) ;
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
}
