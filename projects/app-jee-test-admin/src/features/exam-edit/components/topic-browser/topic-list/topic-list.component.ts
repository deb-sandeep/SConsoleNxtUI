import { Component, input, output } from '@angular/core';
import { TopicSO } from "@jee-common/util/master-data-types";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'topic-list',
  imports: [
    FormsModule,
  ],
  templateUrl: './topic-list.component.html',
  styleUrl: './topic-list.component.css'
})
export class TopicListComponent {

  protected readonly Object = Object ;

  topics = input<TopicSO[]>() ;
  topicChanged = output<TopicSO>() ;

  selectedTopic: TopicSO|null = null ;

  topicSelectionChanged( topic: TopicSO ) {
    this.selectedTopic = topic ;
    this.topicChanged.emit( topic ) ;
  }

  clearOldSelectionIfAny( currentTopicSelection:TopicSO|null ) {
    if( currentTopicSelection != this.selectedTopic ) {
      this.selectedTopic = null ;
    }
  }
}
