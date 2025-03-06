import { TimedEntity } from "./base-entities";

export class Pause extends TimedEntity {

  id: number = -1 ;
  sessionId:number = -1 ;

  constructor( sessionId:number ) {
    super();
    this.sessionId = sessionId ;
  }
}