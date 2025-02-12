import { TopicTrackAssignmentSO } from "../../../server-object-types" ;
import { Track } from "./track";
import { Topic } from "./topic";

export class TopicSchedule {

  static readonly DEFAULT_TOPIC_BUFFER_LEFT_DAYS = 0 ;
  static readonly DEFAULT_TOPIC_BUFFER_RIGHT_DAYS = 3 ;
  static readonly DEFAULT_TOPIC_THEORY_MARGIN_DAYS = 5 ;

  public prev:TopicSchedule|null = null ;
  public next:TopicSchedule|null = null ;

  public track:Track;
  public topic:Topic;

  public id?:number ;
  public sequence:number ;
  public bufferLeft:number ;
  public bufferRight:number ;
  public theoryMargin:number ;
  public startDate:Date ;
  public endDate:Date ;

  public constructor( vo:TopicTrackAssignmentSO,
                      track:Track,
                      topic:Topic ) {

    this.id           = vo.id ;
    this.sequence     = vo.sequence ;
    this.bufferLeft   = vo.bufferLeft ;
    this.bufferRight  = vo.bufferRight ;
    this.theoryMargin = vo.theoryMargin ;
    this.startDate    = vo.startDate ;
    this.endDate      = vo.endDate ;

    this.topic = topic ;
    this.track = track ;
  }
}