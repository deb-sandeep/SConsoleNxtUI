import { TrackSO } from "../../../server-object-types" ;
import { TopicSchedule } from "./topic-schedule";
import { Syllabus } from "./syllabus";
import { Topic } from "./topic";
import { Colors } from "../util/colors";

export class Track {

  public id: number ;
  public trackName: string ;
  public colors: Colors ;
  public syllabusName: string ;
  public startDate: Date ;

  public scheduledTopicListHead:TopicSchedule | null = null ;
  public scheduledTopicListTail:TopicSchedule | null = null ;

  public previousTrack:Track | null = null ;
  public nextTrack:Track | null = null ;

  public constructor( public vo:TrackSO, public syllabus:Syllabus ) {
    this.id = vo.id ;
    this.trackName = vo.trackName ;
    this.colors = new Colors( vo.color ) ;
    this.syllabusName = vo.syllabusName ;
    this.startDate = vo.startDate ;

    vo.assignedTopics.forEach( vo => {
      this.addTopicSchedule( new TopicSchedule( vo, this, syllabus.getTopic( vo.topicId ) ) ) ;
    } ) ;
  }

  public isFirstTrack() {
    return this.previousTrack == null ;
  }

  public isLastTrack() {
    return this.nextTrack == null ;
  }

  public containsTopic( topic: Topic ) {
    let scheduledTopic = this.scheduledTopicListHead ;
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

  public addTopicSchedule( ts: TopicSchedule ) {
    if( this.scheduledTopicListTail == null ) {
      this.scheduledTopicListTail = this.scheduledTopicListHead = ts ;
    }
    else {
      this.scheduledTopicListTail.next = ts ;
      this.scheduledTopicListTail = ts ;
    }
  }

  [Symbol.iterator](): Iterator<TopicSchedule> {
    return this.iterator() ;
  }

  *iterator() {
    let currentScheduledTopic = this.scheduledTopicListHead ;
    while( currentScheduledTopic != null ) {
      yield currentScheduledTopic ;
      currentScheduledTopic = currentScheduledTopic.next ;
    }
  }
}