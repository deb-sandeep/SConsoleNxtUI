import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import {
  Alert,
  EditableInput, PageTitleService,
  PageToolbarComponent,
  ToolbarActionComponent
} from "lib-core";
import { Router, RouterLink } from "@angular/router";

import AlertService = Alert.AlertService;
import { NgClass, NgIf } from "@angular/common";

@Component( {
    selector: 'topic-chapter-list',
    standalone: true,
    imports: [
      FormsModule,
      EditableInput,
      RouterLink,
      NgClass,
      PageToolbarComponent,
      ToolbarActionComponent,
      NgIf
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
