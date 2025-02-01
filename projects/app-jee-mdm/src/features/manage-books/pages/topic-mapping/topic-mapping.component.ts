import { Component, inject } from '@angular/core';
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";

import {
  Alert,
  EditableAttributeSaveEvent,
  EditableInput,
  PageTitleService,
  CloseableBadgeComponent
} from "lib-core";

import {
  BookSummary,
  BookTopicMapping,
  ChapterTopicMapping,
  Topic,
  TopicMapping
} from "../../manage-books.type";

import { ManageBooksService } from "../../manage-books.service";

import AlertService = Alert.AlertService;

@Component( {
    selector: 'topic-mapping',
    imports: [
        EditableInput,
        FormsModule,
        CloseableBadgeComponent
    ],
    templateUrl: './topic-mapping.component.html',
    styleUrl: './topic-mapping.component.css'
} )
export class TopicMappingComponent {

  private manageBookSvc = inject( ManageBooksService ) ;
  private alertSvc = inject( AlertService ) ;
  private titleSvc = inject( PageTitleService ) ;
  private router = inject( Router ) ;

  protected readonly Object = Object;

  syllabusName:string = '' ;
  topicMap:Record<number, Topic> = {} ;
  bookTopicMappingList:BookTopicMapping[] = [] ;

  selectedChapter:ChapterTopicMapping | null = null ;
  selectedBook:BookSummary | null = null ;

  constructor() {

    if( this.manageBookSvc.selectedBooks.length == 0 ) {
      this.router.navigateByUrl( '/manage-books/book-list' ).then() ;
      return ;
    }

    this.manageBookSvc.getBookTopicMappings()
        .then( res => {
          this.syllabusName = res.syllabusName ;
          this.topicMap = res.topicMap ;
          this.bookTopicMappingList = res.bookTopicMappingList ;

          this.titleSvc.setTitle( this.syllabusName ) ;
        } )
        .catch( ( msg ) => {
          this.alertSvc.error( `Getting topic mapping failed. Message : ${msg}` ) ;
        } );
  }

  bookTopicMappingDoneFlagChanged( book:BookSummary ) {
    this.manageBookSvc.updateBookAttribute( book, "topicMappingDone", String(book.topicMappingDone) ).then() ;
  }

  topicDisassociated( topicMapping:TopicMapping ) {
    this.manageBookSvc.deleteChapterTopicMapping( topicMapping.mappingId )
      .then( ()=> {
          // If the mapping on the server is successful,
          // remove the topic mapping from the selected chapter topic mapping
          // This will remove the local badge
          this.selectedChapter!.topics = this.selectedChapter!.topics.filter( (tm) => tm.mappingId != topicMapping.mappingId ) ;

          // Set the association flag of the topic to the current
          // selected chapter topic mapping as false. This will remove the
          // topic highlight in the right panel
          let topic = this.topicMap[topicMapping.topicId] ;
          topic.isMappedToSelectedChapter = false ;
      })
      .catch( (msg) => this.alertSvc.error( "Topic disassociation failed. Msg " + msg ) ) ;
  }

  chapterSelected( selectedCtm:ChapterTopicMapping ) {

    // When a chapter is selected, we do the following:
    // 1. Select the chapter, deselecting any previous selection
    // 2. Select the associated topics, deselecting any prior selections
    this.bookTopicMappingList.forEach( btm => {
      btm.chapterTopicMappings.forEach( ctm => {
        ctm.selected = (ctm == selectedCtm) ;
        if( ctm.selected ) {
          this.selectedChapter = ctm ;
          this.selectedBook = btm.book ;

          // Deselect all the topics
          Object.values( this.topicMap )
                .forEach( t => t.isMappedToSelectedChapter = false ) ;

          // Select the topics associated with the current chapter selection
          ctm.topics.forEach( tm => {
            this.topicMap[ tm.topicId ].isMappedToSelectedChapter = true ;
          } ) ;
        }
      })
    }) ;
  }

  async associateTopicWithSelectedChapter( topic: Topic ) {

    try {
      if( this.selectedChapter != null ) {

        // Only if the selected chapter is not already associated with this topic
        if( this.selectedChapter.topics
                .find( tm => tm.topicId == topic.topicId ) === undefined ) {

          const newMappingId = await this.manageBookSvc.createChapterTopicMapping(
                                                                    this.selectedBook!.id,
                                                                    this.selectedChapter!.chapterNum,
                                                                    topic.topicId ) ;
          this.selectedChapter?.topics.push( {
            topicId:topic.topicId,
            mappingId:newMappingId,
          } ) ;
          topic.isMappedToSelectedChapter = true ;
        }
      }
    }
    catch( err ) {
      this.alertSvc.error( "Mapping failed. Message : " + err ) ;
    }
  }

  saveUpdatedChapterName( $evt: EditableAttributeSaveEvent ) {
    let ch = $evt.target as ChapterTopicMapping ;
    this.manageBookSvc
        .updateChapterName( this.selectedBook!.id,
                            ch.chapterNum,
                            $evt.attributeValue )
        .then( () => $evt.target[$evt.attributeName] = $evt.attributeValue )
        .catch( msg => this.alertSvc.error( msg ) ) ;
  }
}
