import { Component, inject } from '@angular/core';
import { ManageBooksService } from "../../manage-books.service";
import { Alert, EditableInput, PageTitleService } from "lib-core";
import AlertService = Alert.AlertService;
import { BookTopicMapping, Topic } from "../../manage-books.type";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CloseableBadgeComponent } from "./closeable-badge.component";

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

  syllabusName:string = '' ;
  topicMap:Record<number, Topic> = {} ;
  bookTopicMappingList:BookTopicMapping[] = [] ;

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
}
