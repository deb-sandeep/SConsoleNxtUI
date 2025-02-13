import { TrackSO } from "../../../server-object-types" ;
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

  public previousTrack:Track | null = null ;
  public nextTrack:Track | null = null ;

  public constructor( vo:TrackSO, syllabus:Syllabus ) {

    this.id = vo.id ;
    this.trackName = vo.trackName ;
    this.colors = new Colors( vo.color ) ;
    this.syllabusName = vo.syllabusName ;
    this.startDate = vo.startDate ;
    this.syllabus = syllabus ;

    vo.assignedTopics.forEach( vo => {
      this.addTopicSchedule( new TopicSchedule( vo, this, syllabus.getTopic( vo.topicId ) ) ) ;
    } ) ;
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

  public addTopicSchedule( ts: TopicSchedule ) {
    if( this.scheduleListTail == null ) {
      this.scheduleListTail = this.scheduleListHead = ts ;
    }
    else {
      ts.prev = this.scheduleListTail ;
      this.scheduleListTail.next = ts ;
      this.scheduleListTail = ts ;
    }
  }

  public isFirstTrack() {
    return this.previousTrack == null ;
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

  private addScheduleBefore( schedule:TopicSchedule, ref:TopicSchedule ) {
    if( ref != null ) {
      let prev = ref.prev ;

      ref.prev = schedule ;
      schedule.next = ref ;
      schedule.prev = prev ;

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

      if( next != null ) next.prev = schedule ;
      if( this.scheduleListTail == ref ) this.scheduleListTail = schedule ;
    }
  }

  public removeSchedule( ts: TopicSchedule, recomputeDates:boolean = true ) {
    let prev = ts.prev ;
    let next = ts.next ;

    if( prev != null ) prev.next = next ;
    if( next != null ) next.prev = prev ;

    if( this.scheduleListHead == ts ) this.scheduleListHead = next ;
    if( this.scheduleListTail == ts ) this.scheduleListTail = prev ;

    ts.prev = ts.next = null ;

    if( recomputeDates ) this.refreshScheduleSequenceAttributes() ;
  }

  public moveScheduleUp( ts: TopicSchedule ) {
    let prev = ts.prev ;
    if( prev != null ) { // A node can be moved up only if its not the head
      this.removeSchedule( ts, false ) ;
      this.addScheduleBefore( ts, prev ) ;
      this.refreshScheduleSequenceAttributes() ;
    }
  }

  public moveScheduleDown( ts: TopicSchedule ) {
    let next = ts.next ;
    if( next != null ) { // A node can be moved down only if its not the tail
      this.removeSchedule( ts, false ) ;
      this.addScheduleAfter( ts, next ) ;
      this.refreshScheduleSequenceAttributes() ;
    }
  }

  private refreshScheduleSequenceAttributes() {
    let nextSequenceNumber = 1 ;
    let nextStartDate = this.startDate ;
    let currentSchedule = this.scheduleListHead ;

    while( currentSchedule != null ) {
      currentSchedule.sequence = nextSequenceNumber ;
      currentSchedule.recomputeDateBoundaries( nextStartDate ) ;
      nextStartDate = dayjs( currentSchedule.endDate ).add( 1, 'day' ).toDate() ;

      currentSchedule = currentSchedule.next ;
      nextSequenceNumber += 1 ;
    }
  }
}