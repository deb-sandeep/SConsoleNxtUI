import { TopicSO } from "../../../server-object-types";
import { Syllabus } from "./syllabus";
import { TopicProblemCounts } from "../manage-tracks.types";

export class Topic {

  public id:number ;
  public sectionName:string ;
  public topicName:string ;
  public problemCounts: TopicProblemCounts ;

  public constructor( public vo:TopicSO, public syllabus:Syllabus ) {

    this.id = vo.id ;
    this.sectionName = vo.sectionName ;
    this.topicName = vo.topicName ;
  }

  public getDefaultDuration() {

    const avgTimePerProblemInMin = this.syllabus.syllabusName.includes( 'Chemistry' ) ? 3 : 5 ;
    const totalTimeInMin = avgTimePerProblemInMin * this.problemCounts.numProblems ;
    const avgTimePerDayInMin = 90 ;

    return Math.ceil( totalTimeInMin / avgTimePerDayInMin ) ;
  }
}