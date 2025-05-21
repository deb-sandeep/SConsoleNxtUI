import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { PausableTimedEntity } from "./base-entities";
import { Pause } from "./pause";
import { Session } from "./session";

export class ProblemAttempt extends PausableTimedEntity {

  id: number = -1 ;
  sessionId: number ;
  prevState: string ;
  targetState: string ;

  session: Session ;

  readonly problem: TopicProblemSO ;

  constructor( problem:TopicProblemSO, session:Session ) {
    super() ;

    this.problem = problem ;

    this.session = session ;
    this.sessionId   = session.sessionId ;
    this.prevState   = problem.problemState ;
    this.targetState = problem.problemState ;
  }

  override updateEndTime( time: Date ) {
    super.updateEndTime( time ) ;
    const effTime = Math.floor( this.effectiveDuration()/1000 ) ;
    if( effTime === 300 ) {
      this.session.playBellSound() ;
    }
    else if( effTime === 450 ) {
      this.session.playDoubleBellSound() ;
    }
  }
}