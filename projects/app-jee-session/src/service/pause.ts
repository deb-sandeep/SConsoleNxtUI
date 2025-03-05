import { signal } from "@angular/core";

export class Pause {

  id: number = -1 ;
  sessionId:number = -1 ;
  startTime:Date ;
  endTime:Date ;

  duration = signal( 0 ) ;

  constructor( sessionId:number ) {
    this.sessionId = sessionId ;
    this.startTime = new Date() ;
    this.endTime = this.startTime ;
  }

  updateEndTime( time:Date ) {
    this.endTime = time ;
    this.duration.set( ( this.endTime.getTime() - this.startTime.getTime() )/1000 ) ;
  }
}