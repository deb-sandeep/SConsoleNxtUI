import { Component, computed, inject, input } from '@angular/core';
import dayjs from 'dayjs';
import { ManageTracksService } from "../../manage-tracks.service";
import { DndDropEvent, DndModule } from "ngx-drag-drop";

import { TopicSO, TopicTrackAssignmentSO, TrackSO } from "../../../../base-types";
import { Colors } from "../../util/colors";
import { TopicComponent } from "../topic/topic.component";

@Component({
  selector: 'study-track',
  imports: [ DndModule, TopicComponent ],
  template: `
    @if( track() ) {
      @let trackBgColor = colors().bodyBackground ;
      @let titleBgColor = colors().titleBackground ;
      @let titleFgColor = colors().titleForeground ;
      
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
          @for( assignedTopic of assignedTopics(); track assignedTopic.topicId ) {
            <topic [assignedTopic]="assignedTopic"></topic>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './track.component.css'
})
export class TrackComponent {

  static readonly DEFAULT_TOPIC_BUFFER_LEFT_DAYS = 0 ;
  static readonly DEFAULT_TOPIC_BUFFER_RIGHT_DAYS = 3 ;
  static readonly DEFAULT_TOPIC_THEORY_MARGIN_DAYS = 5 ;

  svc:ManageTracksService = inject( ManageTracksService ) ;

  track = input.required<TrackSO>() ;
  assignedTopics= computed<TopicTrackAssignmentSO[]>( () => this.track().assignedTopics ) ;

  trackId = computed<number>( () => this.track().id ) ;
  colors   = computed<Colors>( () => this.svc.trackColors[this.trackId()] ) ;

  public getTrackWidth():string {
    let numTracks = this.svc.syllabusTracks[this.svc.selectedSyllabus()].length ;
    return `calc(100%/${numTracks})` ;
  }

  public topicDropped( event:DndDropEvent ):void {
    console.log( `[Track - ${this.track().trackName}] Topic dropped`, event ) ;

    const droppedTopic = event.data as TopicSO ;

    let startDate = this.track().startDate ;
    if( this.assignedTopics().length > 0 ) {
      let lastAssignedTopic = this.assignedTopics()[this.assignedTopics().length - 1];
      startDate = dayjs(lastAssignedTopic.endDate).add( 1, 'day' ).toDate() ;
    }

    const defaultDurationInDays = this.svc.getDefaultDurationForTopic( droppedTopic ) ;
    const endDate = dayjs( startDate ).add( defaultDurationInDays, 'days' )
                                             .add( TrackComponent.DEFAULT_TOPIC_BUFFER_LEFT_DAYS, 'days' )
                                             .add( TrackComponent.DEFAULT_TOPIC_BUFFER_RIGHT_DAYS, 'days' )
                                             .add( TrackComponent.DEFAULT_TOPIC_THEORY_MARGIN_DAYS, 'days' )
                                             .toDate() ;
    this.assignedTopics().push( {
      trackId:this.trackId(),
      sequence:this.assignedTopics().length+1,
      topicId:droppedTopic.id,
      bufferLeft:0,
      bufferRight:3,
      theoryMargin:5,
      startDate:startDate,
      endDate:endDate,
    }) ;
  }
}
