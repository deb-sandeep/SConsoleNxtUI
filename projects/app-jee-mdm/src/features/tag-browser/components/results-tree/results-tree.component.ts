import { Component, inject } from '@angular/core';
import { NgClass } from "@angular/common";
import { DurationPipe } from "lib-core";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { TagBrowserService } from "../../tag-browser.service";

// Syllabus > Topic > (Problems: Book/Chapter > Exercise, Questions: flat)
// collapsible results tree — the visual language is problem-history's own
// table markup (see problem-history.component.html), extended with the two
// outer grouping levels since a tag query can span many topics/syllabi at
// once (problem-history is always scoped to one topic already).
@Component({
  selector: 'results-tree',
  imports: [ NgClass, DurationPipe ],
  templateUrl: './results-tree.component.html',
  styleUrl: './results-tree.component.css'
})
export class ResultsTreeComponent {

  protected svc = inject( TagBrowserService ) ;
  protected readonly SConsoleUtil = SConsoleUtil ;
  protected readonly Object = Object ;

  isSelectedProblem( p:TopicProblemSO ):boolean {
    return this.svc.selectedItem?.itemType === 'PROBLEM' && this.svc.selectedItem.item.problemId === p.problemId ;
  }

  isSelectedQuestion( q:QuestionSO ):boolean {
    return this.svc.selectedItem?.itemType === 'QUESTION' && this.svc.selectedItem.item.id === q.id ;
  }

  difficultyIcon( level:number ):string {
    return level > 0 ? 'bi-star-fill' : 'bi-star' ;
  }
}
