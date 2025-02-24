import { TopicTrackAssignmentSO, TrackSO } from "@jee-common/master-data-types" ;
import { TopicSchedule } from "./topic-schedule";
import { Syllabus } from "./syllabus";
import { Topic } from "./topic";
import { Colors } from "../util/colors";
import dayjs from "dayjs";

export class Track {

  public id: number ;
  public trackName: string ;
  public colors: Colors ;
  public syllabusName: string ;
  public startDate: Date ;
  public syllabus: Syllabus ;

  public scheduleListHead:TopicSchedule | null = null ;
  public scheduleListTail:TopicSchedule | null = null ;

  public prevTrack:Track | null = null ;
  public nextTrack:Track | null = null ;

  private dirtyFlag:boolean = false ;

  public constructor( vo:TrackSO, syllabus:Syllabus ) {

    this.id = vo.id ;
    this.trackName = vo.trackName ;
    this.colors = new Colors( vo.color ) ;
    this.syllabusName = vo.syllabusName ;
    this.startDate = dayjs( vo.startDate ).toDate() ;
    this.syllabus = syllabus ;

    vo.assignedTopics.forEach( vo => {
      this.addTopicSchedule( new TopicSchedule( vo, this, syllabus.getTopic( vo.topicId ) ) ) ;
    } ) ;

    this.dirtyFlag = false ;
  }

  [Symbol.iterator](): Iterator<TopicSchedule> {
    return this.iterator() ;
  }

  *iterator() {
    let currentScheduledTopic = this.scheduleListHead ;
    while( currentScheduledTopic != null ) {
      yield currentScheduledTopic ;
      currentScheduledTopic = currentScheduledTopic.next ;
    }
  }

  public isFirstTrack() {
    return this.prevTrack == null ;
  }

  public isLastTrack() {
    return this.nextTrack == null ;
  }

  public containsTopic( topic: Topic ) {
    let scheduledTopic = this.scheduleListHead ;
    while( scheduledTopic != null ) {
      if( scheduledTopic.topic == topic ) {
        return true ;
      }
      else {
        scheduledTopic = scheduledTopic.next ;
      }
    }
    return false ;
  }

  public getNumTopicsScheduled(): number {
    let numTopics = 0 ;
    let scheduledTopic = this.scheduleListHead ;
    while( scheduledTopic != null ) {
      numTopics++ ;
      scheduledTopic = scheduledTopic.next ;
    }
    return numTopics ;
  }

  public getNextStartDate():Date {

    let startDate = this.startDate ;
    if( this.scheduleListTail != null ) {
      startDate = dayjs( this.scheduleListTail.endDate ).add( 1, 'day' ).toDate() ;
    }
    return startDate ;
  }

  public addTopicSchedule( ts: TopicSchedule ) {
    if( this.scheduleListTail == null ) {
      this.scheduleListTail = this.scheduleListHead = ts ;
    }
    else {
      ts.prev = this.scheduleListTail ;
      this.scheduleListTail.next = ts ;
      this.scheduleListTail = ts ;
    }
    ts.track = this ;
    this.dirtyFlag = true ;
  }

  private addScheduleBefore( schedule:TopicSchedule, ref:TopicSchedule ) {
    if( ref != null ) {
      let prev = ref.prev ;

      ref.prev = schedule ;
      schedule.next = ref ;
      schedule.prev = prev ;
      schedule.track = this ;

      if( prev != null ) prev.next = schedule ;
      if( this.scheduleListHead == ref ) this.scheduleListHead = schedule ;
    }
  }

  private addScheduleAfter( schedule:TopicSchedule, ref:TopicSchedule ) {
    if( ref != null ) {
      let next = ref.next ;

      ref.next = schedule ;
      schedule.next = next ;
      schedule.prev = ref ;
      schedule.track = this ;

      if( next != null ) next.prev = schedule ;
      if( this.scheduleListTail == ref ) this.scheduleListTail = schedule ;
    }
  }

  public removeSchedule( ts: TopicSchedule, topicUnassigned:boolean = true ) {
    let prev = ts.prev ;
    let next = ts.next ;

    if( prev != null ) prev.next = next ;
    if( next != null ) next.prev = prev ;

    if( this.scheduleListHead == ts ) this.scheduleListHead = next ;
    if( this.scheduleListTail == ts ) this.scheduleListTail = prev ;

    ts.prev = ts.next = null ;
    ts.track = null ;

    if( topicUnassigned ) {
      ts.selected = false ;
      this.recomputeScheduleSequenceAttributes() ;
      this.syllabus.svc.setSelectedTopicSchedule( null ) ;
      this.dirtyFlag = true ;
    }
  }

  public moveScheduleUp( ts: TopicSchedule ) {
    let prev = ts.prev ;
    if( prev != null ) { // A node can be moved up only if its not the head
      this.removeSchedule( ts, false ) ;
      this.addScheduleBefore( ts, prev ) ;
      this.recomputeScheduleSequenceAttributes() ;
    }
  }

  public moveScheduleDown( ts: TopicSchedule ) {
    let next = ts.next ;
    if( next != null ) { // A node can be moved down only if its not the tail
      this.removeSchedule( ts, false ) ;
      this.addScheduleAfter( ts, next ) ;
      this.recomputeScheduleSequenceAttributes() ;
    }
  }

  public moveScheduleToNextTrack( ts:TopicSchedule ) {
      this.removeSchedule( ts, false ) ;
      this.recomputeScheduleSequenceAttributes() ;
      this.nextTrack!.addTopicSchedule( ts ) ;
      this.nextTrack!.recomputeScheduleSequenceAttributes() ;
  }

  public moveScheduleToPrevTrack( ts:TopicSchedule ) {
    this.removeSchedule( ts, false ) ;
    this.recomputeScheduleSequenceAttributes() ;
    this.prevTrack!.addTopicSchedule( ts ) ;
    this.prevTrack!.recomputeScheduleSequenceAttributes() ;
  }

  public recomputeScheduleSequenceAttributes() {
    let nextSequenceNumber = 1 ;
    let nextStartDate = this.startDate ;
    let currentSchedule = this.scheduleListHead ;

    while( currentSchedule != null ) {
      currentSchedule.sequence = nextSequenceNumber ;
      currentSchedule.alignStartDate( nextStartDate ) ;
      nextStartDate = dayjs( currentSchedule.endDate ).add( 1, 'day' ).toDate() ;

      currentSchedule = currentSchedule.next ;
      nextSequenceNumber += 1 ;
    }
  }

  public recomputeExerciseDays() {
    let currentSchedule = this.scheduleListHead ;
    while( currentSchedule != null ) {
      currentSchedule.recomputeExerciseDays() ;
      currentSchedule = currentSchedule.next ;
    }
  }

  public isDirty() {
    for( let ts of this ) {
      if( ts.isDirty() ) return true ;
    }
    return this.dirtyFlag ;
  }

  public getTopicTrackAssignmentSOs() {
    const assignments:TopicTrackAssignmentSO[] = [] ;

    let currentSchedule = this.scheduleListHead ;
    while( currentSchedule != null ) {
      assignments.push( currentSchedule.getTopicTrackAssignmentSO() ) ;
      currentSchedule = currentSchedule.next ;
    }
    return assignments ;
  }

  public refreshSavedState( schedules: TopicTrackAssignmentSO[] ) {

    let currentSchedule = this.scheduleListHead ;
    for( let schedule of schedules ) {
      currentSchedule!.refreshSavedState( schedule ) ;
      currentSchedule = currentSchedule!.next ;
    }
    this.dirtyFlag = false ;
  }
}