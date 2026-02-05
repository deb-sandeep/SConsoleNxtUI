import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent, PageTitleService } from "lib-core";
import { QuestionRepoService } from "../question-repo/question-repo.service";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchCriteriaPaneComponent } from "./components/search-criteria-pane/search-criteria-pane.component";
import { QuestionsListingPaneComponent } from "./components/questions-listing-pane/questions-listing-pane.component";

@Component({
  selector: 'question-browser',
  imports: [
    PageTitleComponent,
    NgbDropdownModule,
    ReactiveFormsModule,
    SearchCriteriaPaneComponent,
    QuestionsListingPaneComponent
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
