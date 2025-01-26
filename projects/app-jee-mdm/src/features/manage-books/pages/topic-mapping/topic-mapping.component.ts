import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, PageTitleService } from "lib-core";
import AlertService = Alert.AlertService;
import { BookTopicMapping, Topic } from "../../manage-books.type";
import { Router } from "@angular/router";

@Component( {
  selector: 'topic-mapping',
  standalone: true,
  imports: [],
  templateUrl: './topic-mapping.component.html',
  styleUrl: './topic-mapping.component.css'
} )
export class TopicMappingComponent {

  private manageBookSvc = inject( ManageBooksService ) ;
  private alertSvc = inject( AlertService ) ;
  private titleSvc = inject( PageTitleService ) ;
  private router = inject( Router ) ;

  syllabusName:string = '' ;
  topicMap:Record<number, Topic> = {} ;
  bookTopicMappingList:BookTopicMapping[] = [] ;

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
}
