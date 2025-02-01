import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import AlertService = Alert.AlertService;
import { ManageProblemsService } from "../../manage-problems.service";
import { TopicChapterMapping } from "../../manage-problems.type";

@Component( {
  selector: 'topic-chapter-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent,
    CommonModule
  ],
  templateUrl: './topic-chapter-list.component.html',
  styleUrl: './topic-chapter-list.component.css'
} )
export class TopicChapterListComponent {

  private alertSvc = inject( AlertService );
  private router = inject( Router );
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private manageProblemsSvc:ManageProblemsService = inject( ManageProblemsService ) ;

  topicChapterMappings = signal<TopicChapterMapping[]>( [] ) ;

  constructor() {
    this.changeSyllabus( 'IIT Physics' ).then() ;
  }

  async changeSyllabus( syllabusName:string ) {
    this.titleSvc.setTitle( syllabusName ) ;
    this.topicChapterMappings.set( await this.manageProblemsSvc.getTopicChapterMappings( syllabusName ) ) ;
  }

  selectChapter( mappingId:number, toggle:boolean=true ) {
    this.topicChapterMappings().forEach( tcm => {
      tcm.chapters.forEach( ch => {
        ch.selected = ( ch.mappingId == mappingId ) ? (toggle?!ch.selected:true) : false ;
      } )
    })
  }

  moveChapter( tcm:TopicChapterMapping, index:number, dir:'up'|'down' ) {

    this.selectChapter( tcm.chapters[index].mappingId, false ) ;

    // TODO: Swap on chapter and on success, update the UI, else show error

    let targetIndex = dir=='up'?index-1:index+1 ;
    let temp = tcm.chapters[targetIndex] ;

    tcm.chapters[targetIndex] = tcm.chapters[index] ;
    tcm.chapters[index] = temp ;
  }
}
