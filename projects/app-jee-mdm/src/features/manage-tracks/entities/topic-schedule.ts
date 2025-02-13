import { TopicTrackAssignmentSO } from "../../../server-object-types" ;
import { Track } from "./track";
import { Topic } from "./topic";
import dayjs from "dayjs";

export class TopicSchedule {

  static readonly DEFAULT_TOPIC_BUFFER_LEFT_DAYS = 0 ;
  static readonly DEFAULT_TOPIC_BUFFER_RIGHT_DAYS = 3 ;
  static readonly DEFAULT_TOPIC_THEORY_MARGIN_DAYS = 5 ;

  public prev:TopicSchedule|null = null ;
  public next:TopicSchedule|null = null ;

  public track:Track|null = null ;
  public topic:Topic;

  public id?:number ;
  public sequence:number ;
  public bufferLeft:number ;
  public theoryMargin:number ;
  public exerciseDays:number ;
  public bufferRight:number ;
  public startDate:Date ;
  public endDate:Date ;
  public numDays:number ;
  public selected:boolean = false ;

  private dirtyFlag:boolean = false ;

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
    this.numDays      = dayjs( this.endDate ).diff( this.startDate, 'days' ) ;
    this.exerciseDays = this.numDays - this.bufferLeft - this.bufferRight - this.theoryMargin ;

    this.topic = topic ;
    this.track = track ;
  }

  public isFirst() {
    return this.prev == null ;
  }

  public isLast() {
    return this.next == null ;
  }

  public isDirty() {
    return this.dirtyFlag ;
  }

  public setSelected() {
    this.selected = true ;
    this.track!.syllabus.svc.setSelectedTopicSchedule( this ) ;
  }

  public alignStartDate( startDate: Date ) {
    this.startDate = startDate ;
    this.endDate = dayjs( startDate ).add( this.numDays, 'days' ).toDate() ;
    this.dirtyFlag = true ;
  }

  public recomputeEndDate() {
    this.numDays = this.bufferLeft + this.theoryMargin + this.exerciseDays + this.bufferRight ;
    this.endDate = dayjs( this.startDate ).add( this.numDays, 'days' ).toDate() ;
    this.dirtyFlag = true ;
    this.track!.refreshScheduleSequenceAttributes() ;
  }
}