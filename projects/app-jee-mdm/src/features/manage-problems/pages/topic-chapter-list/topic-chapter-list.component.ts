import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { Router } from "@angular/router";

import AlertService = Alert.AlertService;

@Component( {
  selector: 'topic-chapter-list',
  imports: [
    FormsModule,
    PageToolbarComponent,
    ToolbarActionComponent,
  ],
  templateUrl: './topic-chapter-list.component.html',
  styleUrl: './topic-chapter-list.component.css'
} )
export class TopicChapterListComponent {

  private alertSvc = inject( AlertService );
  private router = inject( Router );
  private titleSvc : PageTitleService = inject( PageTitleService ) ;

  constructor() {
    this.changeSyllabus( 'IIT Physics' ) ;
  }

  changeSyllabus( syllabusName:string ) {
    this.titleSvc.setTitle( syllabusName ) ;
  }
}
