import { Component, inject } from '@angular/core';
import { AlertsDisplayComponent, PageTitleComponent, PageTitleService } from "lib-core";
import { ResultsTreeComponent } from "./components/results-tree/results-tree.component";
import { ProblemDetailComponent } from "./components/problem-detail/problem-detail.component";
import { QuestionDetailComponent } from "./components/question-detail/question-detail.component";
import { QueryBuilderPanelComponent } from "./components/query-builder-panel/query-builder-panel.component";
import { TagBrowserService } from "./tag-browser.service";

// Route component for /tag-browser — a tag-based search/explorer across
// Problems and Questions. Composes a floating, left-docked query-builder
// panel (AND/OR/NOT tag tree + optional syllabus/topic/difficulty filters)
// over a results-tree + detail-pane body, structurally the same
// results-then-detail split problem-history uses.
@Component({
  selector: 'tag-browser',
  imports: [
    PageTitleComponent, AlertsDisplayComponent,
    ResultsTreeComponent, ProblemDetailComponent, QuestionDetailComponent,
    QueryBuilderPanelComponent,
  ],
  templateUrl: './tag-browser.component.html',
  styleUrl: './tag-browser.component.css'
})
export class TagBrowserComponent {

  private titleSvc = inject( PageTitleService ) ;
  protected svc = inject( TagBrowserService ) ;

  constructor() {
    this.titleSvc.setTitle( "Tag browser" ) ;
  }
}
