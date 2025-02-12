import { Component, computed, inject, input } from '@angular/core';
import { TopicTrackAssignmentSO } from "../../../../base-types";
import { ManageTracksService } from "../../manage-tracks.service";

@Component({
  selector: 'topic',
  imports: [],
  templateUrl: './topic.component.html',
  styleUrl: './topic.component.css'
})
export class TopicComponent {

  svc = inject( ManageTracksService ) ;

  assignedTopic = input.required<TopicTrackAssignmentSO>() ;
  topic = computed( ()=> this.svc.topicMap[this.assignedTopic().topicId] ) ;

  colors = this.svc.getSelectedSyllabusColors() ;
}
