import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, EditableInput, PageTitleService } from "lib-core";
import { BookTopicMapping, ChapterTopicMapping, Topic } from "../../manage-books.type";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CloseableBadgeComponent } from "./closeable-badge.component";

import AlertService = Alert.AlertService;

@Component( {
  selector: 'topic-mapping',
  standalone: true,
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

  constructor() {

    // if( this.manageBookSvc.selectedBooks.length == 0 ) {
    //   this.router.navigateByUrl( '/manage-books/book-list' ).then() ;
    //   return ;
    // }

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

  topicDisassociated( topicMappingId:number ) {
    console.log( 'Tag closed ' + topicMappingId ) ;
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

  associateTopicWithSelectedChapter( topic: Topic ) {
    if( this.selectedChapter != null ) {
      // Only if the selected chapter is not already associated with this topic
      if( this.selectedChapter.topics
              .find( tm => tm.topicId == topic.topicId ) === undefined ) {

        // TODO: Associate on server
        // TODO: On successful association create a new ctm entry
        console.log( 'Topic is already associated with chapter' ) ;
      }
    }
  }
}
