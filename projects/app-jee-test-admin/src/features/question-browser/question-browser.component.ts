import { Component, OnInit, inject, effect, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageTitleComponent, PageTitleService } from "lib-core";
import { NgbDropdownModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchCriteriaPaneComponent } from "./components/search-criteria-pane/search-criteria-pane.component";
import { QuestionsListingPaneComponent } from "./components/questions-listing-pane/questions-listing-pane.component";
import { QuestionBrowserService } from "./question-browser.service";

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
  private qBrowserSvc : QuestionBrowserService = inject( QuestionBrowserService ) ;

  @ViewChild( "searchCriteriaPane")
  public searchCriteriaPane: SearchCriteriaPaneComponent ;

  constructor() {
    this.titleSvc.setTitle( "Question Browser" ) ;
    effect( () => {
      if( this.qBrowserSvc.searchResults() ) {
        this.titleSvc.setTitle( "Question Browser. " +
          this.qBrowserSvc.searchResults()!.totalResults + " search results.") ;
      }
    } );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let topicId = -1 ;
      let qType = "" ;

      if( params['topicId'] ) {
        topicId = +params['topicId'] ; // Convert to number
      }
      if( params['qType'] ) {
        qType = params['qType'] ;
      }

      if( topicId != -1 ) {
        this.qBrowserSvc.initiateFreshSearch( [topicId] ) ;
      }
    } ) ;
  }
}
