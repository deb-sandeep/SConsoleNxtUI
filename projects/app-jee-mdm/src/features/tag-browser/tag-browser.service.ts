import { computed, inject, Injectable, signal } from "@angular/core";
import { RemoteService } from "lib-core";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagQueryApiService } from "@jee-common/services/tag-query-api.service";
import { SyllabusSO, TopicProblemSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";
import { TagSO } from "@jee-common/util/tag-data-types";
import { TagBrowserFilters, TagQueryConditionNode, TagQueryGroupNode, TagQuerySearchRes } from "@jee-common/util/tag-query-types";
import {
  addChild, createDefaultTagQuery, cycleOp as cycleOpNode, dissolveGroup, findNode,
  newConditionNode, newGroupNode, removeNode, updateNode, validateTree
} from "./entities/query-tree";
import { buildResultsTree } from "./entities/results-tree";

export type SelectedResultItem =
  | { itemType:'PROBLEM', item:TopicProblemSO }
  | { itemType:'QUESTION', item:QuestionSO } ;

const DEFAULT_PAGE_SIZE = 100 ;

function defaultFilters():TagBrowserFilters {
  return {
    syllabusNames:[], topicIds:[], difficultyMin:0,
    timeSpentMin:0, timeSpentMax:30, attempts:'any',
  } ;
}

// Route-scoped store for the tag-browser feature — plain mutable fields plus
// a narrow signal() for the results holder, matching how
// app-jee-exam-admin's QuestionBrowserService drives its own search+results
// screen (see workspace-wide state-management convention in CLAUDE.md).
@Injectable()
export class TagBrowserService extends RemoteService {

  private tagQueryApi = inject( TagQueryApiService ) ;
  private syllabusApi = inject( SyllabusApiService ) ;
  private tagApi = inject( TagApiService ) ;

  syllabus:SyllabusSO[] = [] ;
  recentTags:TagSO[] = [] ;
  mostUsedTags:TagSO[] = [] ;

  tagQuery:TagQueryGroupNode = createDefaultTagQuery() ;
  filters:TagBrowserFilters = defaultFilters() ;

  searchResults = signal<TagQuerySearchRes | null>( null ) ;
  resultsTree = computed( () => buildResultsTree( this.searchResults() ) ) ;
  hasSearched = signal( false ) ;

  selectedItem:SelectedResultItem | null = null ;

  panelOpen = true ;
  filtersSectionOpen = false ;

  // Non-null while the "+tag" telescoping sub-panel is open, naming which
  // group its picked tags will become condition children of.
  pickerGroupId:string | null = null ;
  stagedTags:TagSO[] = [] ;

  // Every TagSO ever picked in this session, keyed by id — the tree only
  // stores tagId per condition node (see TagQueryConditionNode), so the tree
  // UI reads tag names back out of this cache rather than re-fetching. See
  // toggleStagedTag(), the only place tags enter it.
  private tagCache = new Map<number, TagSO>() ;

  constructor() {
    super() ;
    Promise.all( [
      this.syllabusApi.getAllSyllabus(),
      this.tagApi.getRecentTags(),
      this.tagApi.getMostUsedTags(),
    ] ).then( ( [ syllabus, recent, mostUsed ] ) => {
      this.syllabus = syllabus ;
      this.recentTags = recent ;
      this.mostUsedTags = mostUsed ;
    } ) ;
  }

  // ---- tree editing ----------------------------------------------------

  cycleOp( id:string ) {
    this.tagQuery = updateNode( this.tagQuery, id,
      n => n.type === 'group' ? cycleOpNode( n ) : n ) ;
  }

  toggleCollapse( id:string ) {
    this.tagQuery = updateNode( this.tagQuery, id,
      n => n.type === 'group' ? { ...n, collapsed: !n.collapsed } : n ) ;
  }

  toggleNegate( id:string ) {
    this.tagQuery = updateNode( this.tagQuery, id,
      n => n.type === 'condition' ? { ...n, negate: !n.negate } : n ) ;
  }

  removeNode( id:string ) {
    if( id === 'root' ) return ;
    this.tagQuery = removeNode( this.tagQuery, id ) ;
  }

  dissolveGroup( id:string ) {
    this.tagQuery = dissolveGroup( this.tagQuery, id ) ;
  }

  addGroup( parentGroupId:string ) {
    this.tagQuery = addChild( this.tagQuery, parentGroupId, newGroupNode() ) ;
  }

  isTreeValid():boolean {
    return validateTree( this.tagQuery ) ;
  }

  // ---- tag-picker staging ------------------------------------------------
  // The reused tag-association-dialog child widgets (tag-search-box,
  // quick-access-tabs, browse-by-topic) all emit `tagSelected` immediately —
  // they have no notion of a staged, not-yet-committed selection. That
  // staging is built fresh here: opening the picker seeds `stagedTags` from
  // the target group's current conditions, toggling adds/removes locally,
  // and only `commitTagPicker` actually mutates the tree.

  openTagPicker( groupId:string ) {
    const group = findNode( this.tagQuery, groupId ) ;
    const staged = group && group.type === 'group'
      ? group.children.filter( ( c ):c is TagQueryConditionNode => c.type === 'condition' )
          .map( c => this.tagById( c.tagId ) )
          .filter( ( t ):t is TagSO => t !== null )
      : [] ;
    this.pickerGroupId = groupId ;
    this.stagedTags = staged ;
  }

  closeTagPicker() {
    this.pickerGroupId = null ;
    this.stagedTags = [] ;
  }

  toggleStagedTag( tag:TagSO ) {
    this.tagCache.set( tag.id, tag ) ;
    const has = this.stagedTags.some( t => t.id === tag.id ) ;
    this.stagedTags = has
      ? this.stagedTags.filter( t => t.id !== tag.id )
      : [ ...this.stagedTags, tag ] ;
  }

  getTagName( tagId:number ):string {
    return this.tagCache.get( tagId )?.tagText ?? `#${tagId}` ;
  }

  stagedTagIds():Set<number> {
    return new Set( this.stagedTags.map( t => t.id ) ) ;
  }

  // Diffs `stagedTags` against the target group's current condition
  // children — removes conditions for tags no longer staged, adds
  // conditions for newly staged tags — a direct port of the prototype's own
  // commitTagPicker() reducer.
  commitTagPicker() {
    const groupId = this.pickerGroupId ;
    if( !groupId ) return ;
    const group = findNode( this.tagQuery, groupId ) ;
    if( !group || group.type !== 'group' ) { this.closeTagPicker() ; return ; }

    const currentTagIds = group.children
      .filter( ( c ):c is TagQueryConditionNode => c.type === 'condition' )
      .map( c => c.tagId ) ;
    const stagedTagIds = this.stagedTags.map( t => t.id ) ;

    let tree = this.tagQuery ;
    group.children
      .filter( c => c.type === 'condition' && !stagedTagIds.includes( c.tagId ) )
      .forEach( c => { tree = removeNode( tree, c.id ) ; } ) ;
    stagedTagIds
      .filter( tagId => !currentTagIds.includes( tagId ) )
      .forEach( tagId => { tree = addChild( tree, groupId, newConditionNode( tagId ) ) ; } ) ;

    this.tagQuery = tree ;
    this.closeTagPicker() ;
  }

  // Best-effort lookup used only to render already-picked tag names when
  // seeding the picker's staged set — falls back to null (silently dropped
  // from the staged set) if a tag was never cached (shouldn't happen: every
  // condition node's tagId was added via toggleStagedTag, which caches it).
  private tagById( tagId:number ):TagSO | null {
    return this.tagCache.get( tagId ) ?? null ;
  }

  // ---- filters -----------------------------------------------------------

  toggleFiltersSection() {
    this.filtersSectionOpen = !this.filtersSectionOpen ;
  }

  toggleSyllabus( name:string ) {
    const has = this.filters.syllabusNames.includes( name ) ;
    this.filters = { ...this.filters, syllabusNames: has
      ? this.filters.syllabusNames.filter( n => n !== name )
      : [ ...this.filters.syllabusNames, name ] } ;
  }

  toggleTopic( topicId:number ) {
    const has = this.filters.topicIds.includes( topicId ) ;
    this.filters = { ...this.filters, topicIds: has
      ? this.filters.topicIds.filter( id => id !== topicId )
      : [ ...this.filters.topicIds, topicId ] } ;
  }

  setDifficultyMin( level:number ) {
    this.filters = { ...this.filters, difficultyMin: this.filters.difficultyMin === level ? 0 : level } ;
  }

  setTimeSpentMin( minutes:number ) {
    const v = Math.min( minutes, this.filters.timeSpentMax ) ;
    this.filters = { ...this.filters, timeSpentMin: v } ;
  }

  setTimeSpentMax( minutes:number ) {
    const v = Math.max( minutes, this.filters.timeSpentMin ) ;
    this.filters = { ...this.filters, timeSpentMax: v } ;
  }

  setAttempts( value:TagBrowserFilters['attempts'] ) {
    this.filters = { ...this.filters, attempts: value } ;
  }

  // ---- search --------------------------------------------------------

  openPanel() { this.panelOpen = true ; }
  closePanel() { this.panelOpen = false ; this.closeTagPicker() ; }

  async applyQuery() {
    if( !this.isTreeValid() ) return ;
    const res = await this.tagQueryApi.search(
      this.tagQuery, this.filters, 0, 0, DEFAULT_PAGE_SIZE
    ) ;
    this.searchResults.set( res ) ;
    this.hasSearched.set( true ) ;
    this.selectedItem = null ;
    this.panelOpen = false ;
  }

  selectProblem( p:TopicProblemSO ) {
    this.selectedItem = { itemType:'PROBLEM', item:p } ;
  }

  selectQuestion( q:QuestionSO ) {
    this.selectedItem = { itemType:'QUESTION', item:q } ;
  }
}
