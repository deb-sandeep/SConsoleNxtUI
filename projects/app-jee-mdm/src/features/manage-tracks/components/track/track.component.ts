import { Component, input } from '@angular/core';
import dayjs from 'dayjs';
import { DndDropEvent, DndModule } from "ngx-drag-drop";

import { TopicScheduleComponent } from "../topic-schedule/topic-schedule.component";
import { Track } from "../../entities/track";
import { TopicSchedule } from "../../entities/topic-schedule";

@Component({
  selector: 'study-track',
  imports: [ DndModule, TopicScheduleComponent ],
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
          {{ track().trackName }}
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

    const defaultDurationInDays = droppedTopic.getDefaultDuration() ;

    let startDate = this.track().getNextStartDate() ;
    const endDate = dayjs( startDate ).add( defaultDurationInDays, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_BUFFER_LEFT_DAYS, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_BUFFER_RIGHT_DAYS, 'days' )
                                             .add( TopicSchedule.DEFAULT_TOPIC_THEORY_MARGIN_DAYS, 'days' )
                                             .toDate() ;

    this.track().addTopicSchedule( new TopicSchedule({
      trackId:this.track().id,
      sequence:this.track().getNumTopicsScheduled()+1,
      topicId:droppedTopic.id,
      bufferLeft:TopicSchedule.DEFAULT_TOPIC_BUFFER_LEFT_DAYS,
      bufferRight:TopicSchedule.DEFAULT_TOPIC_BUFFER_RIGHT_DAYS,
      theoryMargin:TopicSchedule.DEFAULT_TOPIC_THEORY_MARGIN_DAYS,
      startDate:startDate,
      endDate:endDate,
    }, this.track(), droppedTopic )) ;
  }
}
