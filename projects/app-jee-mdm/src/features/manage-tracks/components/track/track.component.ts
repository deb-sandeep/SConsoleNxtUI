import { Component, computed, inject, input } from '@angular/core';
import { ManageTracksService } from "../../manage-tracks.service";
import { DndDropEvent, DndModule } from "ngx-drag-drop";

import { Track } from "../../../../base-types";
import { Colors } from "../../util/colors";

@Component({
  selector: 'study-track',
  imports: [DndModule],
  template: `
    @if( track() ) {
      @let trackBgColor = colors().bodyBackground ;
      @let titleBgColor = colors().titleBackground ;
      
      <div class="track"
           [style.background-color]="trackBgColor"
           [style.width]="getTrackWidth()"
           dndDropzone
           (dndDrop)="topicDropped( $event )"
           dndDragoverClass="drag-over">
        <div class="track-title"
             [style.background-color]="titleBgColor">
          {{ track().trackName }}
        </div>
        <div class="topic-list">
        </div>
      </div>
    }
  `,
  styleUrl: './track.component.css'
})
export class TrackComponent {

  svc:ManageTracksService = inject( ManageTracksService ) ;

  track = input.required<Track>() ;
  trackId = computed<number>( () => this.track().id ) ;
  colors   = computed<Colors>( () => this.svc.trackColors[this.trackId()] ) ;

  public getTrackWidth():string {
    let numTracks = this.svc.syllabusTracks[this.svc.selectedSyllabus()].length ;
    return `calc(100%/${numTracks})` ;
  }

  public topicDropped( event:DndDropEvent ):void {
    console.log( `[Track - ${this.track().trackName}] Topic dropped`, event ) ;
  }
}
