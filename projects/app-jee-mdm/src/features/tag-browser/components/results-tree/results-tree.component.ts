import { Component, effect, inject } from '@angular/core';
import { NgClass } from "@angular/common";
import { DurationPipe } from "lib-core";
import { TopicProblemSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";
import { SConsoleUtil } from "@jee-common/util/common-util";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { TaggableItemType, TagAssociationTarget } from "@jee-common/util/tag-data-types";
import { TagAssociationDialogComponent } from "@jee-common/widgets/tag-association-dialog/tag-association-dialog.component";
import { TagQuerySearchRes } from "@jee-common/util/tag-query-types";
import { TagBrowserService } from "../../tag-browser.service";
import { syllabusHeaderColors } from "../../entities/syllabus-header-colors";

// Syllabus > Topic > (Problems: Book/Chapter > Exercise, Questions: flat)
// collapsible results tree — the visual language is problem-history's own
// table markup (see problem-history.component.html), extended with the two
// outer grouping levels since a tag query can span many topics/syllabi at
// once (problem-history is always scoped to one topic already). Also
// mirrors problem-history's tag-icon column + tag-association-dialog
// wiring, generalized to cover both Problems and Questions.
@Component({
  selector: 'results-tree',
  imports: [ NgClass, DurationPipe, TagAssociationDialogComponent ],
  templateUrl: './results-tree.component.html',
  styleUrl: './results-tree.component.css'
})
export class ResultsTreeComponent {

  protected svc = inject( TagBrowserService ) ;
  private tagAssociationApi = inject( TagAssociationApiService ) ;

  protected readonly SConsoleUtil = SConsoleUtil ;
  protected readonly Object = Object ;

  problemTagCounts:Record<number, number> | null = null ;
  questionTagCounts:Record<number, number> | null = null ;

  tagDialogShow = false ;
  tagDialogTargets:TagAssociationTarget[] = [] ;
  tagDialogTopicId:number | undefined = undefined ;

  constructor() {
    // Refetch tag counts every time a new search result set lands — not
    // wired to onTagsChanged() alone, since a fresh search also needs its
    // own initial fetch.
    effect( () => this.refreshTagCounts( this.svc.searchResults() ) ) ;
  }

  isSelectedProblem( p:TopicProblemSO ):boolean {
    return this.svc.selectedItem?.itemType === 'PROBLEM' && this.svc.selectedItem.item.problemId === p.problemId ;
  }

  isSelectedQuestion( q:QuestionSO ):boolean {
    return this.svc.selectedItem?.itemType === 'QUESTION' && this.svc.selectedItem.item.id === q.id ;
  }

  difficultyIcon( level:number ):string {
    return level > 0 ? 'bi-star-fill' : 'bi-star' ;
  }

  // Falls back to a neutral gray pair when the syllabus (or its color)
  // can't be found — e.g. a stale result row from a syllabus that's since
  // been renamed/removed from the master-data list.
  headerColors( syllabusName:string ) {
    const hex = this.svc.syllabus.find( s => s.syllabusName === syllabusName )?.color ;
    return hex ? syllabusHeaderColors( hex ) : { syllabusBg:'#606060', syllabusFg:'#fff', topicBg:'#8f8f8f', topicFg:'#fff' } ;
  }

  // ---- tag column — mirrors problem-history's
  // getNumTagsForProblem/getTagIconForProblem/getTagIconColorForProblem,
  // generalized to a plain counts-record + id so it works for both
  // Problems and Questions.

  tagIconClass( counts:Record<number, number> | null, id:number ):string {
    const n = counts ? ( counts[ id ] ?? 0 ) : 0 ;
    if( n === 0 ) return 'bi-tag' ;
    if( n === 1 ) return 'bi-tag-fill' ;
    return 'bi-tags-fill' ;
  }

  tagIconColor( counts:Record<number, number> | null, id:number ):string {
    const n = counts ? ( counts[ id ] ?? 0 ) : 0 ;
    return n === 0 ? 'grey' : 'blue' ;
  }

  openTagDialogForProblem( p:TopicProblemSO ) {
    this.openTagDialog( 'PROBLEM', p.problemId, p.problemKey.replaceAll( '/', ' / ' ), p.topicId ) ;
  }

  openTagDialogForQuestion( q:QuestionSO ) {
    this.openTagDialog( 'QUESTION', q.id, q.questionId, q.topicId ) ;
  }

  private openTagDialog( itemType:TaggableItemType, itemId:number, displayLabel:string, topicId:number ) {
    this.tagDialogTargets = [ { itemType, itemId, displayLabel } ] ;
    this.tagDialogTopicId = topicId ;
    this.tagDialogShow = true ;
  }

  closeTagDialog() {
    this.tagDialogShow = false ;
  }

  onTagsChanged() {
    this.refreshTagCounts( this.svc.searchResults() ) ;
  }

  private async refreshTagCounts( res:TagQuerySearchRes | null ) {
    if( !res ) {
      this.problemTagCounts = null ;
      this.questionTagCounts = null ;
      return ;
    }
    const problemIds = res.problems.map( p => p.problemId ) ;
    const questionIds = res.questions.map( q => q.id ) ;
    const [ problemCounts, questionCounts ] = await Promise.all( [
      problemIds.length ? this.tagAssociationApi.getTagCounts( 'PROBLEM', problemIds ) : Promise.resolve( {} ),
      questionIds.length ? this.tagAssociationApi.getTagCounts( 'QUESTION', questionIds ) : Promise.resolve( {} ),
    ] ) ;
    this.problemTagCounts = problemCounts ;
    this.questionTagCounts = questionCounts ;
  }
}
