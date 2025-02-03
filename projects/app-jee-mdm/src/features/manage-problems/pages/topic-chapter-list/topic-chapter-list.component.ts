import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { ActivatedRoute, Router } from "@angular/router";
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
    CommonModule,
  ],
  templateUrl: './topic-chapter-list.component.html',
  styleUrl: './topic-chapter-list.component.css'
} )
export class TopicChapterListComponent {

  private alertSvc = inject( AlertService ) ;
  private router = inject( Router ) ;
  private route = inject( ActivatedRoute ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private manageProblemsSvc:ManageProblemsService = inject( ManageProblemsService ) ;

  topicChapterMappings = signal<TopicChapterMapping[]>( [] ) ;
  currentSyllabus:string = '' ;

  constructor() {
    this.changeSyllabus( 'IIT Physics' ).then() ;
  }

  async changeSyllabus( syllabusName:string ) {
    this.currentSyllabus = syllabusName ;
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

  async moveChapter( tcm:TopicChapterMapping, index:number, dir:'up'|'down' ) {

    this.selectChapter( tcm.chapters[index].mappingId, false ) ;

    let targetIndex = dir=='up'?index-1:index+1 ;
    let thisCm = tcm.chapters[index] ;
    let targetCm = tcm.chapters[targetIndex] ;

    try {
      await this.manageProblemsSvc.swapAttemptSequence( thisCm.mappingId, targetCm.mappingId ) ;
      tcm.chapters[targetIndex] = thisCm ;
      tcm.chapters[index] = targetCm ;
    }
    catch( err ) {
      this.alertSvc.error( "Error : " + err ) ;
    }
  }

  async toggleProblemMappingDone( cm:any ) {
    try {
      await this.manageProblemsSvc.toggleProblemMapping( cm.mappingId ) ;
    }
    catch( err ) {
      this.alertSvc.error( "Error : " + err ) ;
    }
  }

  showProblemsForChapter( tcm:TopicChapterMapping, bookId:number, chapterNum:number ) {
    this.manageProblemsSvc.selectedTopic = {
      topicId: tcm.topicId,
      topicName: tcm.topicName,
      topicSection: tcm.topicSection,
      syllabusName: this.currentSyllabus
    } ;
    this.router
        .navigate( ['../topic-chapter-problem-list', bookId, chapterNum], {relativeTo: this.route} )
        .then() ;
  }
}
