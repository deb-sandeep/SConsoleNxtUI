import { TopicProblemSO } from "@jee-common/master-data-types";
import { PausableTimedEntity } from "./base-entities";

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
}