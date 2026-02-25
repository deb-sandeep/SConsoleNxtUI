import { Component, input, output, ViewChild } from '@angular/core';
import { TopicSO } from "@jee-common/util/master-data-types";
import {
  NgbNav,
  NgbNavChangeEvent,
  NgbNavContent,
  NgbNavItem,
  NgbNavLinkButton,
  NgbNavOutlet
} from "@ng-bootstrap/ng-bootstrap";
import { TopicListComponent } from "./topic-list/topic-list.component";
import { NgIf } from "@angular/common";

@Component({
  selector: 'div[topicBrowser]',
  imports: [
    NgbNav,
    NgbNavItem,
    NgbNavLinkButton,
    NgbNavContent,
    TopicListComponent,
    NgbNavOutlet,
    NgIf
  ],
  templateUrl: './topic-browser.component.html',
  styleUrl: './topic-browser.component.css'
})
export class TopicBrowserComponent {

  topicMap = input<Record<string, TopicSO[]>>({}) ;
  topicChanged = output<TopicSO|null>() ;

  @ViewChild( "phyTopics" )
  phyTopics : TopicListComponent ;

  @ViewChild( "chemTopics" )
  chemTopics : TopicListComponent ;

  @ViewChild( "mathTopics" )
  mathTopics : TopicListComponent ;

  activeSyllabusTabId = 1 ;

  ngOnChanges() {
    if( 'IIT Physics' in this.topicMap() ) {
      this.activeSyllabusTabId = 1 ;
    }
    else if( 'IIT Chemistry' in this.topicMap() ) {
      this.activeSyllabusTabId = 2 ;
    }
    else {
      this.activeSyllabusTabId = 3 ;
    }
  }

  topicSelectionChanged( newSelectedTopic: TopicSO ) {
    this.handleTopicSelectionChange( newSelectedTopic ) ;
  }

  syllabusChanged( $event: NgbNavChangeEvent ) {
    this.handleTopicSelectionChange( null ) ;
  }

  private handleTopicSelectionChange( newTopic: TopicSO | null ){
    this.phyTopics.clearOldSelectionIfAny( newTopic ) ;
    this.chemTopics.clearOldSelectionIfAny( newTopic ) ;
    this.mathTopics.clearOldSelectionIfAny( newTopic ) ;
    this.topicChanged.emit( newTopic ) ;
  }

}
