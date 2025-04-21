import { SyllabusSO } from "@jee-common/util/master-data-types" ;
import { Topic } from "./topic";

export class Syllabus {

  public syllabusName: string ;
  public subjectName: string ;

  public topicMap:Record<number, Topic> = {} ;

  public constructor( vo:SyllabusSO ) {

    this.syllabusName = vo.syllabusName ;
    this.subjectName = vo.subjectName ;

    vo.topics.forEach( tso => this.topicMap[tso.id] = new Topic( tso, this ) ) ;
  }

  public getTopic( topicId:number ) : Topic {
    return this.topicMap[topicId] ;
  }
}