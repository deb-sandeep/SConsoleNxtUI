import { PROBLEM_TYPES, TopicSO } from "@jee-common/util/master-data-types";
import { Syllabus } from "./syllabus";
import { TopicProblemCounts } from "../manage-tracks.types";
import { config } from "../manage-tracks.config"

export class Topic {

  public id:number ;
  public sectionName:string ;
  public topicName:string ;
  public problemCounts: TopicProblemCounts ;
  public syllabus: Syllabus ;

  private solutionTimeMatrix: Record<string, number> = {} ;

  public constructor( vo:TopicSO, syllabus:Syllabus ) {

    this.id = vo.id ;
    this.sectionName = vo.sectionName ;
    this.topicName = vo.topicName ;
    this.syllabus = syllabus ;

    this.solutionTimeMatrix = this.createSolutionTimeMatrix() ;
  }

  private createSolutionTimeMatrix() {

    const syllabusName = this.syllabus.syllabusName ;
    if( syllabusName.includes( 'Chemistry' ) ) {
      return config.avgSolutionTime.chemistry ;
    }
    else if( syllabusName.includes( 'Physics' ) ){
      return config.avgSolutionTime.physics ;
    }
    else if( syllabusName.includes( 'Maths' ) ){
      return config.avgSolutionTime.maths ;
    }
    else if( syllabusName.includes( 'Reasoning' ) ){
      return config.avgSolutionTime.reasoning ;
    }
    return config.avgSolutionTime.default ;
  }

  public getDefaultExerciseDuration() {

    const totalTimeInMin = this.getProjectedSolutionTime( this.problemCounts.problemTypeCount ) ;
    return Math.ceil( totalTimeInMin / config.avgTimePerTopicPerDay ) ;
  }

  public getRemainingExerciseDuration() {

    const remainingTimeInMin = this.getProjectedSolutionTime( this.problemCounts.remainingProblemTypeCount ) ;
    return Math.ceil( remainingTimeInMin / config.avgTimePerTopicPerDay ) ;
  }

  private getProjectedSolutionTime( problemTypeCounts:Record<string, number> ):number {

    let totalTime = 0 ;
    PROBLEM_TYPES.forEach( type => {
      if( type in this.problemCounts.problemTypeCount ) {
        let numProblems = problemTypeCounts[type as string] ;
        let avgTime = this.solutionTimeMatrix[type as string] ;
        totalTime += numProblems * avgTime ;
      }
    }) ;
    return totalTime ;
  }
}