import { Component, ElementRef, inject, input, OnChanges, output, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { SyllabusSO, TopicSO } from "@jee-common/util/master-data-types";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagSO } from "@jee-common/util/tag-data-types";
import { DeleteTagConfirmDialogComponent } from "./delete-tag-confirm-dialog/delete-tag-confirm-dialog.component";

/**
 * The only `subjectName` values shown as subject tabs. The syllabus list can
 * carry non-subject entries (e.g. "Exam", "Reasoning") that aren't
 * meaningful homes for a concept tag — those are filtered out everywhere via
 * {@link BrowseByTopicComponent.visibleSyllabus}.
 */
const ALLOWED_SUBJECTS = [ 'Physics', 'Chemistry', 'Maths' ] ;

@Component({
  selector: 'browse-by-topic',
  imports: [ FormsModule, DeleteTagConfirmDialogComponent ],
  templateUrl: './browse-by-topic.component.html',
  styleUrl: './browse-by-topic.component.css'
})
/**
 * "Browse by topic" panel: subject tabs → topic list → tag pills for that
 * topic, with inline rename and delete (via the nested
 * `delete-tag-confirm-dialog`). This is the widget's drill-down/management
 * surface, as opposed to `tag-search-box`/`quick-access-tabs` which are
 * pure pickers — rename/delete here mutate the tag catalog itself, not just
 * this dialog session's associations.
 */
export class BrowseByTopicComponent implements OnChanges {

  /**
   * Used for fetching a topic's tag list, and for the rename/delete
   * tag-catalog mutations.
   */
  private tagApi = inject( TagApiService ) ;

  /**
   * Reference to the scrollable `.topic-list` container div, used by
   * {@link scrollActiveTopicIntoView} to find and scroll to the active row.
   */
  @ViewChild( 'topicListEl' ) topicListRef!:ElementRef<HTMLElement> ;

  /**
   * Full subject → topic tree from the host; filtered down to
   * {@link ALLOWED_SUBJECTS} via {@link visibleSyllabus} before use.
   */
  syllabus = input<SyllabusSO[]>( [] ) ;

  /**
   * Tag ids to hide from the tag-pill list — the tags already attached to
   * the current target(s).
   */
  excludeTagIds = input<Set<number>>( new Set() ) ;

  /**
   * Topic id to default the subject tab and topic selection to when this
   * component first initializes (typically the topic of the item being
   * tagged) — see {@link ngOnChanges}.
   */
  defaultTopicId = input<number | undefined>() ;

  /**
   * Whether the rename (pencil) and delete (×) icons on each tag pill are
   * shown at all. Defaults to true (existing behaviour); hosts using this
   * purely as a picker (e.g. a search/query context, where mutating the tag
   * catalog mid-search is out of place) pass `false`.
   */
  allowCatalogEdits = input( true ) ;

  /** Emitted when the user clicks a tag pill to apply it. */
  tagSelected = output<TagSO>() ;

  /**
   * Emitted after a tag is deleted (via {@link deleteTag}) — the host uses
   * this to refresh its "Recently used"/"Frequently used" quick-access
   * lists, which could otherwise keep showing a now-deleted tag.
   */
  tagDeleted = output<void>() ;

  /**
   * Which subject tab is active; null only before {@link ngOnChanges} has
   * run its one-time initialization for this dialog session.
   */
  activeSubject:string | null = null ;

  /**
   * Which topic row is selected within the active subject; null when the
   * active subject has no topics at all.
   */
  selectedTopicId:number | null = null ;

  /**
   * Free-text filter typed into the topic-list search field; reset to
   * empty whenever the subject tab changes.
   */
  topicFilterQuery = "" ;

  /**
   * The tag catalog for {@link selectedTopicId}, fetched fresh every time
   * the selected topic changes — see {@link selectTopic}.
   */
  topicTags:TagSO[] = [] ;

  /**
   * Id of the tag pill currently in inline-rename mode, or null when no
   * pill is being renamed.
   */
  editingTagId:number | null = null ;

  /**
   * The in-progress edited text for {@link editingTagId}, bound to the
   * rename input.
   */
  editingText = "" ;

  /**
   * Error text shown under the tag-pill list if a rename fails (e.g.
   * server-side duplicate rejection); null when there's nothing to show.
   */
  editError:string | null = null ;

  /**
   * The tag awaiting delete confirmation in the nested
   * `delete-tag-confirm-dialog`, or null when that dialog is closed.
   */
  tagPendingDelete:TagSO | null = null ;

  /**
   * Angular lifecycle callback — invoked after every change to this
   * component's inputs (`syllabus`, `excludeTagIds`, `defaultTopicId`),
   * including the first one on creation.
   *
   * Runs its actual initialization logic only once per dialog session,
   * guarded by `activeSubject !== null` — this matters because `syllabus`
   * itself arrives asynchronously (the host starts this component with an
   * empty array, then patches in the real data once its fetch resolves,
   * which re-triggers this callback), so the first call or two may see an
   * empty {@link visibleSyllabus} and must wait rather than initialize with
   * nothing. Because the host now recreates this whole component fresh on
   * every dialog open (see the class doc on `TagAssociationDialogComponent`),
   * this guard only needs to protect against re-running within a single
   * session, not across sessions.
   *
   * Once real subject data is available, picks the subject tab containing
   * {@link defaultTopicId} if there is one, otherwise falls back to the
   * first subject; then does the equivalent fallback for the topic itself
   * within that subject, and hands off to {@link selectTopic} to actually
   * load that topic's tags.
   */
  ngOnChanges() {
    // already initialized for this dialog session
    if( this.activeSubject !== null ) return ;
    const subjectList = this.visibleSyllabus() ;
    if( subjectList.length === 0 ) return ;

    const defaultSubject = subjectList.find( s =>
      s.topics.some( t => t.id === this.defaultTopicId() ) )?.subjectName ;

    this.activeSubject = defaultSubject ?? subjectList[0].subjectName ;
    const topics = this.subjectTopics() ;
    const initialTopicId = topics.some( t => t.id === this.defaultTopicId() )
      ? this.defaultTopicId()
      : topics[0]?.id ;
    this.selectTopic( initialTopicId ) ;
  }

  /**
   * {@link syllabus} filtered down to {@link ALLOWED_SUBJECTS} — the raw
   * syllabus list can carry non-subject entries (e.g. "Exam", "Reasoning")
   * that aren't meaningful homes for a concept tag, so every other method
   * here reads through this instead of `syllabus()` directly.
   */
  visibleSyllabus():SyllabusSO[] {
    return this.syllabus().filter( s => ALLOWED_SUBJECTS.includes( s.subjectName ) ) ;
  }

  /**
   * The topic list belonging to {@link activeSubject}, or empty if no
   * subject is active yet.
   */
  subjectTopics():TopicSO[] {
    return this.visibleSyllabus()
               .find( s =>
                 s.subjectName === this.activeSubject )?.topics ?? [] ;
  }

  /**
   * {@link subjectTopics} filtered by the current (case-insensitive)
   * {@link topicFilterQuery} text — the full list when the query is empty.
   */
  filteredTopics():TopicSO[] {
    const q = this.topicFilterQuery.trim().toLowerCase() ;
    const topics = this.subjectTopics() ;
    if( q.length === 0 ) return topics ;
    return topics.filter( t => t.topicName.toLowerCase().includes( q ) ) ;
  }

  /**
   * {@link topicTags} with already-attached tags filtered out via
   * {@link excludeTagIds}.
   */
  visibleTopicTags():TagSO[] {
    return this.topicTags.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  /**
   * Invoked when a subject tab is clicked. Switches the active subject,
   * clears the topic filter (a filter typed under one subject is unlikely
   * to be meaningful under another), and selects that subject's first topic
   * so the topic/tag panes never show a stale selection from the previous
   * subject.
   */
  selectSubject( subjectName:string ) {
    this.activeSubject = subjectName ;
    this.topicFilterQuery = "" ;
    this.selectTopic( this.subjectTopics()[0]?.id ) ;
  }

  /**
   * Invoked when a topic row is clicked, and also internally by
   * {@link ngOnChanges}/{@link selectSubject} to apply a default/first
   * selection. A `null`/`undefined` id (the active subject has no topics at
   * all) just clears the selection and tag list. Otherwise, sets the
   * selection immediately, kicks off an async fetch of that topic's tag
   * catalog (assigned into {@link topicTags} once it resolves — there is no
   * stale-response guard here since a user can't switch topics fast enough
   * for this to meaningfully race, unlike the debounced free-text search in
   * `tag-search-box`), and schedules {@link scrollActiveTopicIntoView} via
   * `setTimeout` so it runs after Angular has applied the new `.active`
   * class to the topic row in the DOM (synchronously right after this method
   * returns, the DOM wouldn't be updated yet).
   */
  selectTopic( topicId:number | null | undefined ) {
    if( topicId == null ) {
      this.selectedTopicId = null ;
      this.topicTags = [] ;
      return ;
    }
    this.selectedTopicId = topicId ;
    this.fetchTopicTags( topicId ) ;
    // Deferred so the '.active' class has already been applied to the new
    // topic row by the time we query for it.
    setTimeout( () => this.scrollActiveTopicIntoView() ) ;
  }

  /**
   * Fetches `topicId`'s tag catalog and assigns it into {@link topicTags},
   * sorted ascending by creation date (oldest first) — the backend doesn't
   * guarantee an order.
   */
  private fetchTopicTags( topicId:number ) {
    this.tagApi.getTagsForTopic( topicId ).then( tags => {
      this.topicTags = tags.sort( ( a, b ) => a.createdAt.localeCompare( b.createdAt ) ) ;
    } ) ;
  }

  /**
   * Public command, called by the host (`tag-association-dialog`) via
   * `@ViewChild` after an attach/detach elsewhere in the dialog — an
   * association count change on the currently-shown topic's tags wouldn't
   * otherwise be reflected here until the user switched topics and back.
   * No-ops if no topic is currently selected.
   */
  refreshTopicTags() {
    if( this.selectedTopicId != null ) this.fetchTopicTags( this.selectedTopicId ) ;
  }

  /**
   * Finds the currently-active `.topic-row` inside the topic-list container
   * and scrolls it into view (`block: 'nearest'` — only scrolls if it isn't
   * already visible), so picking a default/new topic never leaves it hidden
   * below the fold.
   */
  private scrollActiveTopicIntoView() {
    this.topicListRef?.nativeElement.querySelector( '.topic-row.active' )
      ?.scrollIntoView( { block: 'nearest' } ) ;
  }

  /**
   * Invoked when a tag pill's label is clicked — emits the pick for the
   * host to attach.
   */
  attach( tag:TagSO ) {
    this.tagSelected.emit( tag ) ;
  }

  /**
   * Invoked by a pill's pencil/rename icon — switches that pill into
   * inline-edit mode, pre-filled with its current text, and clears any
   * leftover error from a previous edit attempt.
   */
  startEdit( tag:TagSO ) {
    this.editingTagId = tag.id ;
    this.editingText = tag.tagText ;
    this.editError = null ;
  }

  /**
   * Invoked on rename-cancel (button click or Escape) — exits edit mode
   * without saving.
   */
  cancelEdit() {
    this.editingTagId = null ;
    this.editingText = "" ;
  }

  /**
   * Invoked on rename-confirm (save button click or Enter). No-ops on blank
   * (whitespace-only) text or if nothing is being edited. On success,
   * updates the renamed tag's text in {@link topicTags} in place (rather
   * than re-fetching the whole topic) and exits edit mode. On failure,
   * leaves edit mode open and shows the server's error text inline so the
   * user can correct and retry.
   */
  async confirmEdit() {
    const text = this.editingText.trim() ;
    if( text.length === 0 || this.editingTagId == null ) return ;
    const tagId = this.editingTagId ;
    try {
      await this.tagApi.renameTag( tagId, text ) ;
      this.topicTags = this.topicTags.map( t => t.id === tagId ? { ...t, tagText: text } : t ) ;
      this.cancelEdit() ;
    }
    catch( err ) {
      this.editError = String( err ) ;
    }
  }

  /**
   * Invoked by a pill's delete ("x") icon. A tag with zero associations has
   * nothing at stake, so it's deleted immediately without the confirm
   * dialog; otherwise opens `delete-tag-confirm-dialog` for that tag rather
   * than deleting immediately.
   */
  requestDelete( tag:TagSO ) {
    if( tag.associationCount === 0 ) {
      this.deleteTag( tag ).then() ;
      return ;
    }
    this.tagPendingDelete = tag ;
  }

  /**
   * Invoked on `(cancelled)` from `delete-tag-confirm-dialog` — closes it
   * without deleting anything.
   */
  cancelDelete() {
    this.tagPendingDelete = null ;
  }

  /**
   * Invoked on `(confirmed)` from `delete-tag-confirm-dialog` — closes the
   * confirm dialog and deletes the pending tag via {@link deleteTag}.
   */
  async confirmDelete() {
    const tag = this.tagPendingDelete ;
    if( !tag ) return ;
    this.tagPendingDelete = null ;
    await this.deleteTag( tag ) ;
  }

  /**
   * Deletes the tag record itself (and with it every association across
   * every item it was ever attached to — not just this topic's list), then
   * removes it from {@link topicTags} so the pill disappears immediately
   * without needing a re-fetch. Shared by the zero-association fast path in
   * {@link requestDelete} and the confirmed path in {@link confirmDelete}.
   * Emits {@link tagDeleted} so the host can refresh its quick-access lists.
   */
  private async deleteTag( tag:TagSO ) {
    await this.tagApi.deleteTag( tag.id ) ;
    this.topicTags = this.topicTags.filter( t => t.id !== tag.id ) ;
    this.tagDeleted.emit() ;
  }
}
