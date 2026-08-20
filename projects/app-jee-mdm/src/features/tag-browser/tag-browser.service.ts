import { computed, inject, Injectable, signal } from "@angular/core";
import { RemoteService } from "lib-core";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { stripCollapsed, TagQueryApiService } from "@jee-common/services/tag-query-api.service";
import { SyllabusSO, TopicProblemSO, TopicSO } from "@jee-common/util/master-data-types";
import { QuestionSO } from "@jee-common/util/exam-data-types";
import { TagSO } from "@jee-common/util/tag-data-types";
import {
  SavedTagQueryVO, TagBrowserFilters, TagQueryConditionNode, TagQueryGroupNode, TagQuerySearchRes
} from "@jee-common/util/tag-query-types";
import {
  addChild, collectTagIds, createDefaultTagQuery, cycleOp as cycleOpNode, dissolveGroup, findNode,
  hydrateTree, newConditionNode, newGroupNode, removeNode, updateNode, validateTree
} from "./entities/query-tree";
import { buildResultsTree } from "./entities/results-tree";

export type SelectedResultItem =
  | { itemType:'PROBLEM', item:TopicProblemSO }
  | { itemType:'QUESTION', item:QuestionSO } ;

// "Exam"/"Reasoning" aren't meaningful search facets here (mirrors the same
// exclusion tag-association-dialog.component.ts applies via its own
// EXCLUDED_SUBJECTS, and browse-by-topic.component.ts's inverse
// ALLOWED_SUBJECTS) — neither the Syllabus filter, its default-checked set,
// nor the Topic picker should offer them.
const EXCLUDED_SUBJECTS = [ 'Exam', 'Reasoning' ] ;

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

  // Whether the "Browse topics" telescoping sub-panel is open, and its
  // staged (not-yet-committed) selection — same staged-then-commit-on-Done
  // shape as the tag picker's pickerGroupId/stagedTags. Seeded from
  // filters.topicIds by openTopicPicker(), only written back by
  // commitTopicPicker() ("Done"); closeTopicPicker() ("Cancel") discards it.
  showTopicPicker = false ;
  stagedTopicIds:number[] = [] ;

  // Every TagSO ever picked in this session, keyed by id — the tree only
  // stores tagId per condition node (see TagQueryConditionNode), so the tree
  // UI reads tag names back out of this cache rather than re-fetching. See
  // toggleStagedTag(), the only place tags enter it (besides
  // loadSavedQuery()'s own hydration step below).
  private tagCache = new Map<number, TagSO>() ;

  // Saved-queries dropdown (query-builder-panel's header "Saved" button).
  savedQueries:SavedTagQueryVO[] = [] ;
  showSavedQueriesMenu = false ;
  saveQueryFormOpen = false ;
  saveQueryName = "" ;
  savedQueryPendingDelete:SavedTagQueryVO | null = null ;

  // Set once a saved query is loaded (or freshly saved) — displayed above
  // the tag tree, with a dirty ("*") marker whenever tagQuery/filters have
  // since diverged from loadedQuerySnapshot. Cleared by resetQuery() or by
  // deleting the currently-loaded query out from under itself.
  loadedSavedQuery:SavedTagQueryVO | null = null ;
  private loadedQuerySnapshot:{ tagQuery:TagQueryGroupNode, filters:TagBrowserFilters } | null = null ;

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
      // Default the Syllabus filter to "all checked" once the real list is
      // in — can't do this synchronously in defaultFilters() since the
      // syllabus list itself is fetched async.
      this.filters = { ...this.filters, syllabusNames: this.visibleSyllabus().map( s => s.syllabusName ) } ;
    } ) ;
  }

  visibleSyllabus():SyllabusSO[] {
    return this.syllabus.filter( s => !EXCLUDED_SUBJECTS.includes( s.subjectName ) ) ;
  }

  // The syllabuses browsable in the topic picker — narrowed to whatever is
  // checked in the Syllabus filter, since that's the set Topic is
  // meaningfully refining. Falls back to every visible syllabus when none
  // are checked (matches filters.syllabusNames' own "[] = no constraint"
  // convention — see tag-query-types.ts).
  topicPickerSyllabus():SyllabusSO[] {
    const visible = this.visibleSyllabus() ;
    if( this.filters.syllabusNames.length === 0 ) return visible ;
    return visible.filter( s => this.filters.syllabusNames.includes( s.syllabusName ) ) ;
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

  // Removes a single already-committed topic chip — used outside the
  // picker (the Topic block's own chip row), so it applies immediately,
  // unlike the picker's own staged selection below.
  toggleTopic( topicId:number ) {
    const has = this.filters.topicIds.includes( topicId ) ;
    this.filters = { ...this.filters, topicIds: has
      ? this.filters.topicIds.filter( id => id !== topicId )
      : [ ...this.filters.topicIds, topicId ] } ;
  }

  clearAllTopics() {
    this.filters = { ...this.filters, topicIds: [] } ;
  }

  // Topic-picker-panel staging: unlike toggleTopic() above, nothing here
  // touches filters.topicIds until commitTopicPicker() runs (on "Done") —
  // "Cancel"/dismissing the panel discards stagedTopicIds instead. Mirrors
  // the tag-picker-panel's stagedTags flow.
  openTopicPicker() {
    this.stagedTopicIds = [ ...this.filters.topicIds ] ;
    this.showTopicPicker = true ;
  }

  closeTopicPicker() {
    this.showTopicPicker = false ;
    this.stagedTopicIds = [] ;
  }

  commitTopicPicker() {
    this.filters = { ...this.filters, topicIds: this.stagedTopicIds } ;
    this.closeTopicPicker() ;
  }

  toggleStagedTopic( topicId:number ) {
    const has = this.stagedTopicIds.includes( topicId ) ;
    this.stagedTopicIds = has
      ? this.stagedTopicIds.filter( id => id !== topicId )
      : [ ...this.stagedTopicIds, topicId ] ;
  }

  // Backs the topic-picker-panel's per-syllabus-column select-all/deselect-all
  // icon buttons — operates on the staged set, same as toggleStagedTopic.
  selectAllTopics( topics:TopicSO[] ) {
    const ids = new Set( this.stagedTopicIds ) ;
    topics.forEach( t => ids.add( t.id ) ) ;
    this.stagedTopicIds = Array.from( ids ) ;
  }

  deselectAllTopics( topics:TopicSO[] ) {
    const idsToRemove = new Set( topics.map( t => t.id ) ) ;
    this.stagedTopicIds = this.stagedTopicIds.filter( id => !idsToRemove.has( id ) ) ;
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

  resetTimeSpent() {
    this.filters = { ...this.filters, timeSpentMin:0, timeSpentMax:30 } ;
  }

  setAttempts( value:TagBrowserFilters['attempts'] ) {
    this.filters = { ...this.filters, attempts: value } ;
  }

  // ---- search --------------------------------------------------------

  openPanel() { this.panelOpen = true ; }
  closePanel() { this.panelOpen = false ; this.closeTagPicker() ; }

  async applyQuery() {
    if( !this.isTreeValid() ) return ;
    const res = await this.tagQueryApi.search( this.tagQuery, this.filters ) ;
    this.searchResults.set( res ) ;
    this.hasSearched.set( true ) ;
    this.selectedItem = null ;
    this.panelOpen = false ;
  }

  // Resets the tag tree and filters back to their starting state — same
  // shape the panel opens with on first load (root group empty, Syllabus
  // "all checked", everything else at its inactive default). Doesn't touch
  // the currently-displayed search results; that's a separate action from
  // clearing the query being built.
  resetQuery() {
    this.tagQuery = createDefaultTagQuery() ;
    this.filters = { ...defaultFilters(), syllabusNames: this.visibleSyllabus().map( s => s.syllabusName ) } ;
    this.closeTagPicker() ;
    this.closeTopicPicker() ;
    this.loadedSavedQuery = null ;
    this.loadedQuerySnapshot = null ;
  }

  // True once tagQuery/filters have diverged from the snapshot taken when
  // loadedSavedQuery was loaded/saved. Compares the wire form of the tree
  // (stripCollapsed) since expand/collapse is UI-only and shouldn't count
  // as a real edit.
  isLoadedQueryDirty():boolean {
    if( !this.loadedQuerySnapshot ) return false ;
    const treeChanged = JSON.stringify( stripCollapsed( this.tagQuery ) )
      !== JSON.stringify( stripCollapsed( this.loadedQuerySnapshot.tagQuery ) ) ;
    const filtersChanged = JSON.stringify( this.filters ) !== JSON.stringify( this.loadedQuerySnapshot.filters ) ;
    return treeChanged || filtersChanged ;
  }

  // ---- saved queries ---------------------------------------------------

  toggleSavedQueriesMenu() {
    this.showSavedQueriesMenu = !this.showSavedQueriesMenu ;
    if( this.showSavedQueriesMenu ) this.refreshSavedQueries().then() ;
    else this.cancelSaveQueryForm() ;
  }

  private async refreshSavedQueries() {
    this.savedQueries = await this.tagQueryApi.getSavedQueries() ;
  }

  // Opens the name-input form for confirmSaveQuery() — used for both the
  // very first save and "Save As…". Pre-fills the current loaded query's
  // name (if any) as a starting point for a rename/copy, matching common
  // "Save As" UX elsewhere.
  openSaveQueryForm() {
    this.saveQueryFormOpen = true ;
    this.saveQueryName = this.loadedSavedQuery?.name ?? "" ;
  }

  cancelSaveQueryForm() {
    this.saveQueryFormOpen = false ;
    this.saveQueryName = "" ;
  }

  // Always creates a new saved-query row — used both for the first-ever
  // save (no query loaded yet) and for "Save As…" (a query is loaded, but
  // the user wants a new named copy rather than overwriting it). Either
  // way, the newly created row becomes the loaded query going forward.
  async confirmSaveQuery() {
    if( !this.isTreeValid() || !this.saveQueryName.trim() ) return ;
    const created = await this.tagQueryApi.saveQuery( this.saveQueryName.trim(), this.tagQuery, this.filters ) ;
    this.loadedSavedQuery = created ;
    this.loadedQuerySnapshot = { tagQuery: this.tagQuery, filters: this.filters } ;
    this.cancelSaveQueryForm() ;
    await this.refreshSavedQueries() ;
  }

  // "Save" on an already-loaded query — overwrites it in place. SaveQuery
  // upserts by name server-side (same name -> same id, row updated), so
  // re-saving under loadedSavedQuery's existing name is itself the update;
  // no separate delete-old step is needed (a prior version of this method
  // did create-then-delete-old, which — since the id comes back unchanged —
  // deleted the row it had just updated).
  async updateLoadedQuery() {
    if( !this.loadedSavedQuery || !this.isTreeValid() ) return ;
    const updated = await this.tagQueryApi.saveQuery( this.loadedSavedQuery.name, this.tagQuery, this.filters ) ;
    this.loadedSavedQuery = updated ;
    this.loadedQuerySnapshot = { tagQuery: this.tagQuery, filters: this.filters } ;
    await this.refreshSavedQueries() ;
  }

  // Loads a saved query's tree+filters into the builder and immediately
  // runs the search — same end state as manually rebuilding the query and
  // clicking Apply. The tree comes back in wire form (no 'collapsed',
  // no tag names) — hydrateTree() restores the UI shape, and
  // hydrateTagNames() resolves every tagId not already in tagCache before
  // the tree is assigned, so tag-query-tree-node never renders a `#42`
  // fallback for a freshly-loaded query.
  async loadSavedQuery( sq:SavedTagQueryVO ) {
    const req = await this.tagQueryApi.getSavedQuery( sq.id ) ;
    const tree = hydrateTree( req.tagQuery ) as TagQueryGroupNode ;
    await this.hydrateTagNames( tree ) ;
    this.tagQuery = tree ;
    this.filters = req.filters ;
    this.loadedSavedQuery = sq ;
    this.loadedQuerySnapshot = { tagQuery: tree, filters: req.filters } ;
    this.showSavedQueriesMenu = false ;
    await this.applyQuery() ;
  }

  private async hydrateTagNames( tree:TagQueryGroupNode ) {
    const ids = new Set<number>() ;
    collectTagIds( tree, ids ) ;
    const missing = Array.from( ids ).filter( id => !this.tagCache.has( id ) ) ;
    const tags = await Promise.all( missing.map( id => this.tagApi.getTag( id ).catch( () => null ) ) ) ;
    tags.forEach( t => { if( t ) this.tagCache.set( t.id, t ) ; } ) ;
  }

  requestDeleteSavedQuery( sq:SavedTagQueryVO ) {
    this.savedQueryPendingDelete = sq ;
  }

  cancelDeleteSavedQuery() {
    this.savedQueryPendingDelete = null ;
  }

  async confirmDeleteSavedQuery() {
    const sq = this.savedQueryPendingDelete ;
    if( !sq ) return ;
    this.savedQueryPendingDelete = null ;
    await this.tagQueryApi.deleteSavedQuery( sq.id ) ;
    if( this.loadedSavedQuery?.id === sq.id ) {
      this.loadedSavedQuery = null ;
      this.loadedQuerySnapshot = null ;
    }
    await this.refreshSavedQueries() ;
  }

  selectProblem( p:TopicProblemSO ) {
    this.selectedItem = { itemType:'PROBLEM', item:p } ;
  }

  selectQuestion( q:QuestionSO ) {
    this.selectedItem = { itemType:'QUESTION', item:q } ;
  }
}
