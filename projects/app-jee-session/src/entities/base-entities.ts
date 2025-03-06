import { Pause } from "./pause";
import { signal } from "@angular/core";

export class TimedEntity {

  startTime:Date = new Date() ;
  endTime:Date = new Date() ;

  duration = signal<number>( 0 ) ;

  constructor() {
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
  }

  updateEndTime( time:Date ) {
    this.endTime = time ;
    this.duration.set( this.endTime.getTime() - this.startTime.getTime() ) ;
  }
}

export class PausableTimedEntity extends TimedEntity {

  pauses:Pause[] = [] ;
  effectiveDuration = signal<number>(0) ;

  addPause( pause: Pause ){
    this.pauses.push( pause ) ;
  }

  override updateEndTime( time: Date ) {
    super.updateEndTime( time ) ;

    const totalDuration = this.endTime.getTime() - this.startTime.getTime() ;
    const pauseDuration = this.pauses.reduce( (total:number, pause:Pause) => total + pause.duration(), 0 ) ;

    this.effectiveDuration.set( totalDuration - pauseDuration ) ;
  }
}