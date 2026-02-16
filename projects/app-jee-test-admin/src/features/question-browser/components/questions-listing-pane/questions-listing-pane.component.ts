import { Component, inject } from '@angular/core';
import { QuestionBrowserService } from "../../question-browser.service";
import { QuestionDisplayComponent } from "../question-display/question-display.component";
import { PagingControlComponent } from "../paging-control/paging-control.component";

@Component({
  selector: 'questions-listing-pane',
  imports: [
    QuestionDisplayComponent,
    PagingControlComponent
  ],
  templateUrl: './questions-listing-pane.component.html',
  styleUrl: './questions-listing-pane.component.css'
})
export class QuestionsListingPaneComponent {

  qBrowserSvc : QuestionBrowserService = inject( QuestionBrowserService ) ;
}
