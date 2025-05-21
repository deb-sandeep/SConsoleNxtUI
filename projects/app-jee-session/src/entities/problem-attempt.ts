import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { PausableTimedEntity } from "./base-entities";
import { Pause } from "./pause";

export class ProblemAttempt extends PausableTimedEntity {

  id: number = -1 ;
  sessionId: number ;
  prevState: string ;
  targetState: string ;

  readonly problem: TopicProblemSO ;

  constructor( sessionId:number, problem:TopicProblemSO ) {
    super() ;

    this.problem = problem ;

    this.sessionId   = sessionId ;
    this.prevState   = problem.problemState ;
    this.targetState = problem.problemState ;
  }

  override updateEndTime( time: Date ) {
    super.updateEndTime( time ) ;
    const effTime = Math.floor( this.effectiveDuration()/1000 ) ;
    if( effTime > 0 ) {
      if( effTime === 300 ) {
        let audio = new Audio( 'audio/bell.mp3' ) ;
        audio.play().then() ;
      }
      else if( effTime === 450 ) {
        let audio = new Audio( 'audio/double-bell.mp3' ) ;
        audio.play().then() ;
      }
    }
  }
}