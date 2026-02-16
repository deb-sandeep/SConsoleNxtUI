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
  selectionChanged = output<number[]>() ;

  selectedTopics : Record<number, boolean> = {} ;

  topicSelectionChanged( id: number, event:Event ) {
    this.selectedTopics[ id ]  = ( event.target as HTMLInputElement ).checked ;
    this.emitSelectedTopics() ;
  }

  selectAll() {
    for( const topic of this.topics()! ) {
      this.selectedTopics[ topic.id ] = true ;
    }
    this.emitSelectedTopics() ;
  }

  unselectAll() {
    this.selectedTopics = {} ;
    this.emitSelectedTopics() ;
  }

  emitSelectedTopics() {
    const selectedTopicIds: number[] = [] ;
    for( const id in this.selectedTopics ) {
      if( this.selectedTopics[id] ) {
        selectedTopicIds.push( Number( id ) ) ;
      }
    }
    this.selectionChanged.emit( selectedTopicIds ) ;
  }
}
