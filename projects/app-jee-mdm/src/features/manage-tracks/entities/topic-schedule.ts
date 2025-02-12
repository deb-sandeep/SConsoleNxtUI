import { TopicTrackAssignmentSO } from "../../../server-object-types" ;
import { Track } from "./track";
import { Topic } from "./topic";

export class TopicSchedule {

  public prev:TopicSchedule|null = null ;
  public next:TopicSchedule|null = null ;

  public id?:number ;
  public sequence:number ;
  public bufferLeft:number ;
  public bufferRight:number ;
  public theoryMargin:number ;
  public startDate:Date ;
  public endDate:Date ;

  public constructor( public vo:TopicTrackAssignmentSO,
                      public track:Track,
                      public topic:Topic ) {

    this.id           = vo.id ;
    this.sequence     = vo.sequence ;
    this.bufferLeft   = vo.bufferLeft ;
    this.bufferRight  = vo.bufferRight ;
    this.theoryMargin = vo.theoryMargin ;
    this.startDate    = vo.startDate ;
    this.endDate      = vo.endDate ;
  }
}