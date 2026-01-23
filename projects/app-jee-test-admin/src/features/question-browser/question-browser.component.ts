import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent, PageTitleService, PageToolbarComponent } from "lib-core";
import { QuestionRepoService } from "../question-repo/question-repo.service";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'question-browser',
  imports: [
    PageTitleComponent,
    PageToolbarComponent,
    NgbDropdownModule,
    ReactiveFormsModule
  ],
  templateUrl: './question-browser.component.html',
  styleUrl: './question-browser.component.css'
})
export class QuestionBrowserComponent implements OnInit {

  private route: ActivatedRoute = inject( ActivatedRoute ) ;
  private titleSvc : PageTitleService = inject( PageTitleService ) ;
  private questionRepoSvc : QuestionRepoService = inject( QuestionRepoService ) ;

  topicId: number | null = null ;
  qType: string | null = null ;

  constructor() {
    this.titleSvc.setTitle( "Question Browser" ) ;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if( params['topicId'] ) {
        this.topicId = +params['topicId'] ; // Convert to number
      }
      if( params['qType'] ) {
        this.qType = params['qType'] ;
      }
      console.log('Received parameters:', { topicId: this.topicId, qType: this.qType }) ;
    } ) ;
  }
}
