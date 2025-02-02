import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";

import AlertService = Alert.AlertService;
import { ManageProblemsService } from "../../manage-problems.service";
import { ChapterProblemTopicMapping } from "../../manage-problems.type";

@Component( {
  selector: 'topic-chapter-problem-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent,
    CommonModule
  ],
  templateUrl: './topic-chapter-problem-list.component.html',
  styleUrl: './topic-chapter-problem-list.component.css'
} )
export class TopicChapterProblemListComponent {

  private alertSvc = inject( AlertService ) ;
  private route = inject( ActivatedRoute ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private manageProblemsSvc:ManageProblemsService = inject( ManageProblemsService ) ;

  data:ChapterProblemTopicMapping | null = null ;

  constructor() {
    const bookId = this.route.snapshot.params['bookId'] ;
    const chapterNum = this.route.snapshot.params['chapterNum'] ;

    this.manageProblemsSvc
        .getChapterProblemTopicMappings( bookId, chapterNum )
        .then( res => {
          this.data = res ;
          this.titleSvc.setTitle( `${res.book.bookShortName} : ${res.chapterNum} - ${res.chapterName}` ) ;
        } )
        .catch( (err) => this.alertSvc.error( "Error : " + err ) ) ;
  }
}
