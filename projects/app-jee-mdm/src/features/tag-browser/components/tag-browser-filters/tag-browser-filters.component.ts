import { Component, inject } from '@angular/core';
import { TopicSO } from "@jee-common/util/master-data-types";
import { TagBrowserService } from "../../tag-browser.service";

// Optional, non-tag filters ANDed with the tag-query tree: Syllabus, Topic,
// Difficulty, Time spent, Attempts. Status isn't included — TopicProblemSO
// has no simple single "status" scalar suited to a filter the way
// totalDuration/numAttempts are (problemState is a workflow state, not a
// search facet). Time spent/Attempts are Problem-only — see the "Problem-only"
// note on TagBrowserFilters in tag-query-types.ts.
@Component({
  selector: 'tag-browser-filters',
  imports: [],
  templateUrl: './tag-browser-filters.component.html',
  styleUrl: './tag-browser-filters.component.css'
})
export class TagBrowserFiltersComponent {

  protected svc = inject( TagBrowserService ) ;

  protected showTopicPicker = false ;
  protected readonly difficultyLevels = Array.from( { length: 10 }, ( _, i ) => i + 1 ) ;
  protected readonly attemptsOptions = [ 'any', '1', '2+' ] as const ;

  toggleTopicPicker() {
    this.showTopicPicker = !this.showTopicPicker ;
  }

  allTopics():TopicSO[] {
    return this.svc.syllabus.flatMap( s => s.topics ) ;
  }

  topicName( topicId:number ):string {
    return this.allTopics().find( t => t.id === topicId )?.topicName ?? `#${topicId}` ;
  }

  starIcon( level:number ):string {
    return level <= this.svc.filters.difficultyMin ? '★' : '☆' ;
  }

  isTimeSpentActive():boolean {
    return this.svc.filters.timeSpentMin !== 0 || this.svc.filters.timeSpentMax !== 30 ;
  }

  onTimeSpentMinInput( event:Event ) {
    this.svc.setTimeSpentMin( Number( ( event.target as HTMLInputElement ).value ) ) ;
  }

  onTimeSpentMaxInput( event:Event ) {
    this.svc.setTimeSpentMax( Number( ( event.target as HTMLInputElement ).value ) ) ;
  }
}
