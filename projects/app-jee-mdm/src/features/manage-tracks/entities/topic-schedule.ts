import { TopicTrackAssignmentSO } from "@jee-common/util/master-data-types" ;
import { Track } from "./track";
import { Topic } from "./topic";
import dayjs from "dayjs";

export class TopicSchedule {
  static readonly DEFAULT_TOPIC_COACHING_NUM_DAYS = 14 ;
  static readonly DEFAULT_TOPIC_SELF_STUDY_NUM_DAYS = 7 ;
  static readonly DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS = 7 ;
  static readonly DEFAULT_INTER_TOPIC_GAP_NUM_DAYS = 0 ;

  public prev:TopicSchedule|null = null ;
  public next:TopicSchedule|null = null ;

  public track:Track|null = null ;
  public topic:Topic;

  public id?:number ;
  public sequence:number ;
  public coachingNumDays:number ;
  public selfStudyNumDays:number ;
  public exerciseNumDays:number ;
  public consolidationNumDays:number ;
  public startDate:Date ;
  public endDate:Date ;
  public interTopicGapNumDays:number ;
  public numDays:number ;
  public selected:boolean = false ;

  private dirtyFlag:boolean = false ;

  public constructor( vo:TopicTrackAssignmentSO,
                      track:Track,
                      topic:Topic ) {

    this.id = vo.id ;
    this.sequence = vo.sequence ;
    this.startDate = dayjs( vo.startDate ).toDate() ;
    this.endDate = dayjs( vo.endDate ).toDate() ;
    this.numDays = dayjs( this.endDate ).diff( this.startDate, 'days' ) + 1 ;

    this.coachingNumDays = vo.coachingNumDays ;
    this.selfStudyNumDays = vo.selfStudyNumDays ;
    this.consolidationNumDays  = vo.consolidationNumDays ;
    this.exerciseNumDays = this.numDays - this.coachingNumDays - this.consolidationNumDays - this.selfStudyNumDays ;
    this.interTopicGapNumDays = vo.interTopicGapNumDays ;

    this.topic = topic ;
    this.track = track ;
  }

  refreshSavedState( schedule: TopicTrackAssignmentSO ) {
    this.id = schedule.id ;
    this.dirtyFlag = false ;
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
    if( startDate.getTime() !== this.startDate.getTime() ) {
      this.startDate = startDate ;
      this.dirtyFlag = true ;
    }
    this.recomputeEndDate() ;
  }

  public numDaysEdited() {
    this.track!.recomputeScheduleSequenceAttributes() ;
  }

  public recomputeEndDate() {
    let newNumDays = this.coachingNumDays +
                              this.selfStudyNumDays +
                              this.exerciseNumDays +
                              this.consolidationNumDays  ;
    let newEndDate = dayjs( this.startDate ).add( newNumDays-1, 'days' ).toDate() ;

    if( newNumDays !== this.numDays ) {
      this.numDays = newNumDays ;
      this.dirtyFlag = true ;
    }

    if( newEndDate.getTime() !== this.endDate.getTime() ) {
      this.endDate = newEndDate ;
      this.dirtyFlag = true ;
    }
  }

  public recomputeExerciseDays() {
    let newExerciseDays = this.topic.getDefaultExerciseDuration() ;
    if( newExerciseDays != this.exerciseNumDays ) {
      this.exerciseNumDays = newExerciseDays ;
      this.dirtyFlag = true ;
    }
  }

  public getTopicTrackAssignmentSO(): TopicTrackAssignmentSO {
    return {
      trackId: this.track!.id,
      sequence: this.sequence,
      topicId: this.topic.id,
      coachingNumDays: this.coachingNumDays,
      consolidationNumDays: this.consolidationNumDays,
      selfStudyNumDays: this.selfStudyNumDays,
      startDate: this.addUTCOffset( this.startDate ),
      endDate: this.addUTCOffset( this.endDate ),
      interTopicGapNumDays: this.interTopicGapNumDays,
    } as TopicTrackAssignmentSO ;
  }

  private addUTCOffset( date:Date ):Date {
    return dayjs( date ).add( dayjs().utcOffset(), 'minutes' ).toDate() ;
  }
}