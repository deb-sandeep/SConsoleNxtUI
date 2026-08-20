import { Component, inject } from '@angular/core';
import { TopicSO } from "@jee-common/util/master-data-types";
import { TagBrowserService } from "../../tag-browser.service";
import { syllabusDisplayName } from "../../entities/syllabus-display-name";

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
  protected readonly syllabusDisplayName = syllabusDisplayName ;

  protected readonly difficultyLevels = Array.from( { length: 10 }, ( _, i ) => i + 1 ) ;
  protected readonly attemptsOptions = [ 'any', '1', '2+', '3+', '4+', '5+' ] as const ;

  // Each block's body (Syllabus/Topic/Difficulty/Time spent/Attempts) can be
  // collapsed independently by clicking its own header — all start expanded.
  private collapsedBlocks = new Set<string>() ;

  isBlockCollapsed( key:string ):boolean {
    return this.collapsedBlocks.has( key ) ;
  }

  toggleBlock( key:string ) {
    if( this.collapsedBlocks.has( key ) ) this.collapsedBlocks.delete( key ) ;
    else this.collapsedBlocks.add( key ) ;
  }

  // The Syllabus filter defaults to every syllabus checked (see
  // TagBrowserService's post-fetch default), which is functionally "no
  // constraint" — same as every other filter's resting state — so it should
  // NOT read as "active" until the user has actually narrowed it down by
  // unchecking at least one. Unlike the other blocks, "> 0 selected" alone
  // isn't the right active-check here.
  isSyllabusFilterActive():boolean {
    const selected = this.svc.filters.syllabusNames.length ;
    return selected > 0 && selected < this.svc.visibleSyllabus().length ;
  }

  allTopics():TopicSO[] {
    return this.svc.visibleSyllabus().flatMap( s => s.topics ) ;
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
