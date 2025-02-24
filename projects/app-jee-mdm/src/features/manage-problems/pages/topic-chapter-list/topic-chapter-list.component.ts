import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert, LocalStorageService,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import AlertService = Alert.AlertService;
import { ManageProblemsService } from "../../manage-problems.service";
import { TopicChapterMapping } from "../../manage-problems.type";
import { PROBLEM_TYPES } from "@jee-common/master-data-types" ;
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { faCoffee } from '@fortawesome/free-solid-svg-icons'
import { StorageKey } from "@jee-common/storage-keys";

@Component( {
  selector: 'topic-chapter-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent,
    CommonModule,
    FontAwesomeModule
  ],
  templateUrl: './topic-chapter-list.component.html',
  styleUrl: './topic-chapter-list.component.css'
} )
export class TopicChapterListComponent {

  private alertSvc = inject( AlertService ) ;
  private router = inject( Router ) ;
  private route = inject( ActivatedRoute ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private lsSvc : LocalStorageService = inject( LocalStorageService ) ;

  private manageProblemsSvc:ManageProblemsService = inject( ManageProblemsService ) ;

  protected readonly PROBLEM_TYPES = PROBLEM_TYPES;

  topicChapterMappings = signal<TopicChapterMapping[]>( [] ) ;
  currentSyllabus:string = '' ;

  faCoffee = faCoffee ;

  constructor() {
    let lastVisitedSyllabus = this.lsSvc.getItem( StorageKey.LAST_VISITED_SYLLABUS ) ;
    if( lastVisitedSyllabus == null ) {
      lastVisitedSyllabus = 'IIT Maths' ;
    }
    this.changeSyllabus( lastVisitedSyllabus ).then() ;
  }

  async changeSyllabus( syllabusName:string ) {
    this.currentSyllabus = syllabusName ;
    this.titleSvc.setTitle( ' > ' + syllabusName ) ;
    this.lsSvc.setItem( StorageKey.LAST_VISITED_SYLLABUS , this.currentSyllabus ) ;
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

  showChapterProblemsForTopicLinkage( topicChapterMappingId:number, topicId:number, bookId:number, chapterNum:number ) {
    this.router
        .navigate(
          ['../topic-chapter-problem-list', topicChapterMappingId, topicId, bookId, chapterNum ],
          {relativeTo: this.route}
        ).then() ;
  }
}
