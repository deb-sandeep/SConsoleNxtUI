import { TopicSO } from "@jee-common/util/master-data-types";
import { Syllabus } from "./syllabus";

export class Topic {

  public id:number ;
  public sectionName:string ;
  public topicName:string ;
  public syllabus: Syllabus ;

  public constructor( vo:TopicSO, syllabus:Syllabus ) {

    this.id = vo.id ;
    this.sectionName = vo.sectionName ;
    this.topicName = vo.topicName ;
    this.syllabus = syllabus ;
  }
}