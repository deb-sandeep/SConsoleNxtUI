import { TopicTrackAssignmentSO } from "@jee-common/util/master-data-types" ;
import { Track } from "./track";
import { Topic } from "./topic";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend( isBetween );

export class TopicSchedule {
  static readonly DEFAULT_TOPIC_COACHING_NUM_DAYS = 5 ;
  static readonly DEFAULT_TOPIC_SELF_STUDY_NUM_DAYS = 5 ;
  static readonly DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS = 4 ;
  static readonly DEFAULT_INTER_TOPIC_GAP_NUM_DAYS = 0 ;

  static readonly PRE_START = "Yet to start" ;
  static readonly COACHING = "Coaching" ;
  static readonly SELF_STUDY = "Self study" ;
  static readonly EXERCISE = "Exercise" ;
  static readonly CONSOLIDATION = "Wrap-up" ;
  static readonly POST_END = "Ended" ;

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

  private coachingStartDate:Date ;
  private coachingEndDate:Date ;
  private selfStudyStartDate:Date ;
  private selfStudyEndDate:Date ;
  private exerciseStartDate:Date ;
  private exerciseEndDate:Date ;
  private consolidationStartDate:Date ;
  private consolidationEndDate:Date ;

  public currentPhase:string = TopicSchedule.PRE_START ;
  private numExerciseDaysLeft:number = 0 ;

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

    this.computeMilestoneDates() ;
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
    this.dirtyFlag = true ;
    //this.printMilestoneDates() ;
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
    this.computeMilestoneDates() ;
  }

  private computeMilestoneDates() {
    this.coachingStartDate = this.startDate ;
    this.coachingEndDate = dayjs( this.startDate )
      .add( this.coachingNumDays, 'days' )
      .add( -1, 'second')
      .toDate() ;

    this.selfStudyStartDate = dayjs( this.coachingEndDate )
      .add( 1, 'second' )
      .toDate() ;
    this.selfStudyEndDate = dayjs( this.selfStudyStartDate )
      .add( this.selfStudyNumDays, 'days' )
      .add( -1, 'second')
      .toDate() ;

    this.exerciseStartDate = dayjs( this.selfStudyEndDate )
      .add( 1, 'second' )
      .toDate() ;

    this.exerciseEndDate = dayjs( this.exerciseStartDate )
      .add( this.exerciseNumDays, 'days' )
      .add( -1, 'second' )
      .toDate() ;

    this.consolidationStartDate = dayjs( this.exerciseEndDate )
      .add( 1, 'second' )
      .toDate() ;
    this.consolidationEndDate = dayjs( this.consolidationStartDate )
      .add( this.consolidationNumDays, 'days' )
      .add( -1,   'second' )
      .toDate() ;

    this.computeCurrentPhase() ;
  }

  private computeCurrentPhase() {

    this.numExerciseDaysLeft = -1 ;
    const now = dayjs( new Date() ) ;
    if( now.isBefore( this.startDate ) ) {
      this.currentPhase = TopicSchedule.PRE_START;
    }
    else if( now.isBetween( this.startDate, this.coachingEndDate, null, '[]' ) ) {
      this.currentPhase = TopicSchedule.COACHING;
    }
    else if( now.isBetween( this.selfStudyStartDate, this.selfStudyEndDate, null, '[]' ) ) {
      this.currentPhase = TopicSchedule.SELF_STUDY;
    }
    else if( now.isBetween( this.exerciseStartDate, this.exerciseEndDate, null, '[]' ) ) {
      this.currentPhase = TopicSchedule.EXERCISE;
      this.numExerciseDaysLeft = dayjs( this.exerciseEndDate ).diff( now, 'days' ) + 1 ;
    }
    else if( now.isBetween( this.consolidationStartDate, this.consolidationEndDate, null, '[]' ) ) {
      this.currentPhase = TopicSchedule.CONSOLIDATION;
    }
    else {
      this.currentPhase = TopicSchedule.POST_END;
    }
  }

  public printMilestoneDates() {

    console.log( `Topic ${this.topic.topicName} dates:` ) ;
    console.log( `  Coaching      : ${ this.fmtDate( this.coachingStartDate      ) } - ${ this.fmtDate( this.coachingEndDate      ) }` );
    console.log( `  Self Study    : ${ this.fmtDate( this.selfStudyStartDate     ) } - ${ this.fmtDate( this.selfStudyEndDate     ) }` );
    console.log( `  Exercise      : ${ this.fmtDate( this.exerciseStartDate      ) } - ${ this.fmtDate( this.exerciseEndDate      ) }` );
    console.log( `  Consolidation : ${ this.fmtDate( this.consolidationStartDate ) } - ${ this.fmtDate( this.consolidationEndDate ) }` );
  }

  private fmtDate( date: Date ) {
    return dayjs( date ).format( 'YYYY-MMM-DD:HH-mm-ss' ) ;
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

  public getRequiredBurnRate():number {
    const now = dayjs( new Date() ) ;
    if( now.isBefore( this.consolidationStartDate ) ) {
      if( now.isAfter( this.exerciseStartDate ) ) {
        return this.topic.problemCounts.numRemainingProblems / this.numExerciseDaysLeft ;
      }
      else {
        return this.topic.problemCounts.numRemainingProblems / this.exerciseNumDays ;
      }
    }
    return -1 ;
  }

  public isCurrentlyActive() {
    return this.currentPhase === TopicSchedule.COACHING ||
           this.currentPhase === TopicSchedule.SELF_STUDY ||
           this.currentPhase === TopicSchedule.EXERCISE ||
           this.currentPhase === TopicSchedule.CONSOLIDATION ;
  }
}