import { Component, input } from '@angular/core';
import dayjs from 'dayjs';
import { DndDropEvent, DndModule } from "ngx-drag-drop";

import { TopicScheduleComponent } from "../topic-schedule/topic-schedule.component";
import { Track } from "../../entities/track";
import { TopicSchedule } from "../../entities/topic-schedule";
import { DatePipe } from "@angular/common";

import { config } from "../../manage-tracks.config"

@Component({
  selector: 'study-track',
  imports: [ DndModule, TopicScheduleComponent, DatePipe ],
  template: `
    @if( track() ) {
      @let trackBgColor = track().colors.bodyBackground ;
      @let titleBgColor = track().colors.titleBackground ;
      @let titleFgColor = track().colors.titleForeground ;
      
      <div class="track"
           [style.background-color]="trackBgColor"
           [style.width]="getTrackWidth()"
           dndDropzone
           (dndDrop)="topicDropped( $event )"
           dndDragoverClass="drag-over">
        <div class="track-title"
             [style.background-color]="titleBgColor"
             [style.color]="titleFgColor">
          <div class="track-start-date">{{ track().scheduleListHead?.startDate | date}}</div>
          <div class="track-name">[ {{ track().trackName }} ]</div>
          <div class="track-end-date">{{ track().scheduleListTail?.endDate | date}}</div>
        </div>
        <div class="topic-list">
          @for( topicSchedule of track(); track topicSchedule.topic.id ) {
            <topic-schedule [schedule]="topicSchedule"></topic-schedule>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './track.component.css'
})
export class TrackComponent {

  track = input.required<Track>() ;

  public getTrackWidth():string {
    let numTracks = this.track().syllabus.tracks.length ;
    return `calc(100%/${numTracks})` ;
  }

  public topicDropped( event:DndDropEvent ):void {

    const topicId = event.data ;
    const droppedTopic = this.track().syllabus.getTopic( topicId ) ;

    const defaultDurationInDays = droppedTopic.getDefaultExerciseDuration() ;

    let selfStudyMargin = this.getSelfStudyNumDays() ;
    let coachingMargin = this.getCoachingNumDays() ;

    let startDate = this.track().getNextStartDate() ;
    const endDate = dayjs( startDate ).add( defaultDurationInDays, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_COACHING_NUM_DAYS, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS, 'days' )
                                             .add( selfStudyMargin, 'days' )
                                             .toDate() ;

    const schedule = new TopicSchedule({
      trackId:this.track().id,
      sequence:this.track().getNumTopicsScheduled()+1,
      topicId:droppedTopic.id,
      startDate:startDate,
      coachingNumDays:coachingMargin,
      selfStudyNumDays:selfStudyMargin,
      consolidationNumDays:TopicSchedule.DEFAULT_TOPIC_CONSOLIDATION_NUM_DAYS,
      endDate:endDate,
      interTopicGapNumDays:TopicSchedule.DEFAULT_INTER_TOPIC_GAP_NUM_DAYS
    }, this.track(), droppedTopic ) ;

    this.track().addTopicSchedule( schedule ) ;
    this.track().syllabus.svc.setSelectedTopicSchedule( schedule ) ;
  }

  private getSelfStudyNumDays() {

    let syllabusName = this.track().syllabus.syllabusName ;
    if( syllabusName.includes( 'Physics' ) ) {
      return config.defaultSelfStudyNumDays.physics ;
    }
    else if( syllabusName.includes( 'Chemistry' ) ) {
      return config.defaultSelfStudyNumDays.chemistry ;
    }
    else if( syllabusName.includes( 'Maths' ) ) {
      return config.defaultSelfStudyNumDays.maths ;
    }
    else if( syllabusName.includes( 'Reasoning' ) ) {
      return config.defaultSelfStudyNumDays.reasoning ;
    }
    return TopicSchedule.DEFAULT_TOPIC_SELF_STUDY_NUM_DAYS ;
  }

  private getCoachingNumDays() {

    let syllabusName = this.track().syllabus.syllabusName ;
    if( syllabusName.includes( 'Physics' ) ) {
      return config.defaultCoachingNumDays.physics ;
    }
    else if( syllabusName.includes( 'Chemistry' ) ) {
      return config.defaultCoachingNumDays.chemistry ;
    }
    else if( syllabusName.includes( 'Maths' ) ) {
      return config.defaultCoachingNumDays.maths ;
    }
    else if( syllabusName.includes( 'Reasoning' ) ) {
      return config.defaultCoachingNumDays.reasoning ;
    }
    return TopicSchedule.DEFAULT_TOPIC_COACHING_NUM_DAYS ;
  }
}
