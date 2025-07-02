import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { PausableTimedEntity } from "./base-entities";
import { Session } from "./session";
import { config } from "../config";

export class ProblemAttempt extends PausableTimedEntity {

  id: number = -1 ;
  sessionId: number ;
  prevState: string ;
  targetState: string ;
  baseTotalDuration: number ;
  totalDuration : number = 0 ;

  session: Session ;
  alertCfg: any ;

  readonly problem: TopicProblemSO ;

  constructor( problem:TopicProblemSO, session:Session ) {
    super() ;

    this.problem = problem ;

    this.session = session ;
    this.sessionId   = session.sessionId ;
    this.prevState   = problem.problemState ;
    this.targetState = problem.problemState ;

    this.loadAlertCfg() ;
  }

  private loadAlertCfg() {

    this.alertCfg = config.alertTimes.default ;
    if( this.session.syllabus()?.syllabusName === 'IIT Physics' ) {
      this.alertCfg = config.alertTimes.physics ;
    }
    else if( this.session.syllabus()?.syllabusName === 'IIT Chemistry' ) {
      this.alertCfg = config.alertTimes.chemistry ;
    }
    else if( this.session.syllabus()?.syllabusName === 'IIT Maths' ) {
      this.alertCfg = config.alertTimes.maths ;
    }
    else if( this.session.syllabus()?.syllabusName === 'Reasoning' ) {
      this.alertCfg = config.alertTimes.reasoning ;
    }
  }

  override updateEndTime( time: Date ) {
    super.updateEndTime( time ) ;
    const effTime = Math.floor( this.effectiveDuration()/1000 ) ;
    this.totalDuration = ( this.baseTotalDuration + effTime ) * 1000 ;

    this.alertStudent( effTime ) ;
  }

  private alertStudent( effTime:number ) {
    if( effTime === this.alertCfg.firstAlert ) {
      this.session.playBellSound() ;
    }
    else if( effTime === this.alertCfg.secondAlert ) {
      this.session.playDoubleBellSound() ;
    }
    else if( effTime === this.alertCfg.thirdAlert ) {
      this.session.playTripleBellSound() ;
    }
  }
}