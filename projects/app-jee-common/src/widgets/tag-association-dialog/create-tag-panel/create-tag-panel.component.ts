import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from "@angular/forms";

export type TopicOption = { id:number, label:string } ;

@Component({
  selector: 'create-tag-panel',
  imports: [ FormsModule ],
  templateUrl: './create-tag-panel.component.html',
  styleUrl: './create-tag-panel.component.css'
})
export class CreateTagPanelComponent implements OnInit {

  query = input.required<string>() ;
  topics = input<TopicOption[]>( [] ) ;
  defaultTopicId = input<number | undefined>() ;
  errorMessage = input<string | null>( null ) ;

  createAndAttach = output<{ tagText:string, topicId:number }>() ;
  createOnly = output<{ tagText:string, topicId:number }>() ;
  cancel = output<void>() ;

  topicPickerQuery = "" ;
  selectedTopicId:number | null = null ;

  private topicPickerTouched = false ;

  ngOnInit() {
    const current = this.topics().find( t => t.id === this.defaultTopicId() ) ?? this.topics()[0] ;
    if( current ) {
      this.selectedTopicId = current.id ;
      this.topicPickerQuery = current.label ;
    }
  }

  filteredTopics():TopicOption[] {
    const q = this.topicPickerQuery.trim().toLowerCase() ;
    if( q.length === 0 ) return this.topics() ;
    return this.topics().filter( t => t.label.toLowerCase().includes( q ) ) ;
  }

  selectTopic( t:TopicOption ) {
    this.selectedTopicId = t.id ;
    this.topicPickerQuery = t.label ;
  }

  onTopicPickerFocus() {
    // Clear the pre-filled topic label the first time the user focuses the
    // field, so typing starts a fresh filter instead of appending to it.
    if( !this.topicPickerTouched ) {
      this.topicPickerQuery = "" ;
      this.topicPickerTouched = true ;
    }
  }

  onTopicPickerQueryChange( value:string ) {
    this.topicPickerQuery = value ;
    this.topicPickerTouched = true ;
  }

  confirmCreateAndAttach() {
    if( this.selectedTopicId == null ) return ;
    this.createAndAttach.emit( { tagText: this.query(), topicId: this.selectedTopicId } ) ;
  }

  confirmCreateOnly() {
    if( this.selectedTopicId == null ) return ;
    this.createOnly.emit( { tagText: this.query(), topicId: this.selectedTopicId } ) ;
  }

  onEscape() {
    this.cancel.emit() ;
  }
}
