import { PROBLEM_TYPES, TopicSO } from "../../../server-object-types";
import { Syllabus } from "./syllabus";
import { TopicProblemCounts } from "../manage-tracks.types";
import { config } from "../manage-tracks.config"

export class Topic {

  public id:number ;
  public sectionName:string ;
  public topicName:string ;
  public problemCounts: TopicProblemCounts ;
  public syllabus: Syllabus ;

  public constructor( vo:TopicSO, syllabus:Syllabus ) {

    this.id = vo.id ;
    this.sectionName = vo.sectionName ;
    this.topicName = vo.topicName ;
    this.syllabus = syllabus ;
  }

  public getDefaultExerciseDuration() {

    let solutionTimeMatrix = {} ;

    const syllabusName = this.syllabus.syllabusName ;

    if( syllabusName.includes( 'Chemistry' ) ) {
      solutionTimeMatrix = config.avgSolutionTime.chemistry ;
    }
    else if( syllabusName.includes( 'Physics' ) ){
      solutionTimeMatrix = config.avgSolutionTime.physics ;
    }
    else if( syllabusName.includes( 'Maths' ) ){
      solutionTimeMatrix = config.avgSolutionTime.maths ;
    }

    const totalTimeInMin = this.getProjectedSolutionTime( solutionTimeMatrix ) ;

    return Math.ceil( totalTimeInMin / config.avgTimePerTopicPerDay ) ;
  }

  private getProjectedSolutionTime( solutionTimeMatrix:any ):number {
    let totalTime = 0 ;
    PROBLEM_TYPES.forEach( type => {
      if( type in this.problemCounts.problemTypeCount ) {
        let numProblems = this.problemCounts.problemTypeCount[type as string] ;
        let avgTime = solutionTimeMatrix[type as string] ;
        totalTime += numProblems * avgTime ;
      }
    }) ;
    return totalTime ;
  }
}