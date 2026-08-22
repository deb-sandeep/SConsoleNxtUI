import { Component, HostListener, inject, input, OnChanges, output, SimpleChanges, ViewChild } from '@angular/core';
import { CloseableBadgeComponent, ModalDialogComponent } from "lib-core";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO } from "@jee-common/util/master-data-types";
import { normalizeTagText, TaggableItemType, TagAssociationTarget, TagSO } from "@jee-common/util/tag-data-types";
import { TagSearchBoxComponent } from "./tag-search-box/tag-search-box.component";
import { CreateTagPanelComponent, TopicOption } from "./create-tag-panel/create-tag-panel.component";
import { QuickAccessTabsComponent } from "./quick-access-tabs/quick-access-tabs.component";
import { BrowseByTopicComponent } from "./browse-by-topic/browse-by-topic.component";

/**
 * Subject names excluded from the create-panel's topic picker (via
 * {@link TagAssociationDialogComponent.flattenedTopics}) — "Exam" and
 * "Reasoning" aren't meaningful homes for a concept tag, mirroring the
 * same exclusion `browse-by-topic` applies to its own subject tabs.
 */
const EXCLUDED_SUBJECTS = [ 'Exam', 'Reasoning' ] ;

@Component({
  selector: 'tag-association-dialog',
  imports: [
    ModalDialogComponent,
    CloseableBadgeComponent,
    TagSearchBoxComponent,
    CreateTagPanelComponent,
    QuickAccessTabsComponent,
    BrowseByTopicComponent,
  ],
  providers: [ TagApiService, TagAssociationApiService, SyllabusApiService ],
  templateUrl: './tag-association-dialog.component.html',
  styleUrl: './tag-association-dialog.component.css',
})
/**
 * Orchestrator/host component for the tag-association widget.
 *
 * This is the only component the rest of the app talks to — it owns the
 * `<modal-dialog>` chrome and all the top-level state (attached tags,
 * syllabus data, recent/most-used tag lists, the inline "create tag" panel),
 * and wires together five child components that each own a narrower slice
 * of the UI: `tag-search-box` (live search + create trigger), `create-tag-panel`
 * (inline create-and-pick-topic form), `quick-access-tabs` (recent/frequent
 * tag shortcuts) and `browse-by-topic` (subject → topic → tag drill-down,
 * which itself owns `delete-tag-confirm-dialog`).
 *
 * The dialog can operate in two modes, both driven purely by how many
 * `targets` are passed in:
 *  - "single mode" (`targets().length === 1`): editing tags for one problem
 *    or question. The dialog fetches and shows that item's currently
 *    attached tags.
 *  - "bulk mode" (`targets().length > 1`): applying/removing a tag across
 *    several items at once. There is no "currently attached" concept here —
 *    every tag pick/remove is applied to every target.
 *
 * Because `<modal-dialog>`'s own internal `*ngIf="show()"` only hides the
 * DOM, it does NOT destroy the components projected into it — so this
 * component's own template wraps that projected content in `@if( show() )`
 * (see the .html file). That is what makes every child component's state
 * (search text, selected topic, active tab, etc.) start fresh on every
 * open, instead of leaking over from the previous time the dialog was used.
 */
export class TagAssociationDialogComponent implements OnChanges {

  /**
   * Fetches/creates/renames/deletes `Tag` records (the tag itself, not its
   * associations).
   */
  private tagApi = inject( TagApiService ) ;

  /**
   * Attaches/detaches tags to/from problems and questions, and fetches
   * per-item tag lists/counts.
   */
  private tagAssociationApi = inject( TagAssociationApiService ) ;

  /**
   * Fetches the full subject/topic tree, used to populate "Browse by topic"
   * and the create-panel's topic picker.
   */
  private syllabusApi = inject( SyllabusApiService ) ;

  /**
   * Reference to the search box, used to clear its stale query text and
   * return keyboard focus to it once the create-tag-panel flow finishes
   * (Create & attach / Create / Cancel) — see {@link closeCreatePanel}.
   */
  @ViewChild( TagSearchBoxComponent ) searchBoxRef!:TagSearchBoxComponent ;

  /**
   * Reference to `browse-by-topic`, used to refresh its currently-shown
   * topic's tag pills (their association counts) after an attach/detach
   * elsewhere in the dialog — see {@link attachTag}/{@link detachTag}.
   */
  @ViewChild( BrowseByTopicComponent ) browseByTopicRef!:BrowseByTopicComponent ;

  /**
   * Host-controlled visibility flag. Flipping this true is what triggers
   * {@link onOpen} to (re)load the dialog's data.
   */
  show = input.required<boolean>() ;

  /**
   * The problem(s)/question(s) this dialog session is tagging. Its length
   * determines single vs. bulk mode — see the class doc above.
   */
  targets = input.required<TagAssociationTarget[]>() ;

  /**
   * The topic to pre-select in "Browse by topic" when the dialog opens
   * (typically the topic of the item being tagged), and the default topic
   * offered when creating a new tag.
   */
  defaultTopicId = input<number | undefined>() ;

  /**
   * Emitted when the host should hide the dialog (Cancel, the "Done"
   * confirm button, or the modal's own close/backdrop dismissal). Does not
   * itself change `show()` — the host owns that.
   */
  closed = output<void>() ;
  /**
   * Emitted after every successful attach or detach, so the host can
   * refresh anything that depends on tag state (e.g. a per-row tag
   * count/icon in a list). Not emitted for renames/deletes, which don't
   * change *this item's* associations.
   */
  tagsChanged = output<void>() ;

  /**
   * Tags currently attached to the single target in single mode. Always
   * empty in bulk mode (there is no single "currently attached" set to
   * show). Rebuilt from scratch by {@link onOpen} on every open, then kept
   * in sync locally by {@link attachTag}/{@link detachTag}.
   */
  attachedTags:TagSO[] = [] ;

  /**
   * Bulk-mode counterpart to {@link attachedTags}: every tag that appears on
   * *any* of the current targets, each entry's `associationCount` set to how
   * many of the targets carry it (not a global count — see
   * `TagAssociationApiService.getTagAssociationHistogram`). Always empty in
   * single mode. Rebuilt from scratch by {@link onOpen} on every open, then
   * by a full refetch (see {@link fetchBulkTagHistogram}) after every
   * {@link attachTag}/{@link detachTag}.
   */
  tagHistogram:TagSO[] = [] ;

  /**
   * Full subject → topic tree, fetched fresh on every open. Feeds both
   * `browse-by-topic` and, flattened, the create-panel's topic picker (see
   * {@link flattenedTopics}).
   */
  syllabus:SyllabusSO[] = [] ;

  /**
   * The 10 most recently created/used tags (server-ranked), shown in the
   * "Recently used" quick-access tab. Fetched fresh on every open.
   */
  recentTags:TagSO[] = [] ;

  /**
   * The 10 tags with the highest association counts (server-ranked), shown
   * in the "Frequently used" quick-access tab. Fetched fresh on every open.
   */
  mostUsedTags:TagSO[] = [] ;

  /**
   * Whether the inline "create a new tag" panel is expanded below the
   * search box. Opened by a create request from `tag-search-box`, closed on
   * cancel or successful create.
   */
  createPanelOpen = false ;

  /**
   * The tag text to pre-fill into the create panel — carried over from
   * whatever the user had typed into the search box when they triggered
   * "create".
   */
  createPanelQuery = "" ;

  /**
   * Error text shown inside the create panel (e.g. a duplicate-tag warning,
   * or a server error from `createTag`). Null when there's nothing to show.
   */
  createError:string | null = null ;

  /**
   * Non-fatal warning shown under the chip row after a bulk attach only
   * partially succeeds (e.g. the tag was already attached to some, but not
   * all, of the targets). Null when there's nothing to show.
   */
  lastAttachWarning:string | null = null ;

  /**
   * Angular lifecycle callback — invoked automatically after any `@Input`/
   * `input()` binding changes, including the very first binding on
   * component creation.
   *
   * We only care about transitions of the `show` input specifically flipping
   * to `true` (the host opening the dialog); every other input change
   * (e.g. `targets` changing while already open) is ignored. When that
   * transition happens, {@link onOpen} runs to reset and refetch all of
   * this dialog session's data.
   */
  ngOnChanges( changes:SimpleChanges ) {
    if( changes['show'] && this.show() ) {
      this.onOpen() ;
    }
  }

  /**
   * True when tagging exactly one item — drives which copy/behaviour
   * ("Edit tags" vs. "Tag N items", showing the attached-tags chip row,
   * etc.) the template shows.
   */
  isSingleMode():boolean { return this.targets().length === 1 ; }

  /**
   * How many of the current targets are problems — shown in the bulk-mode
   * subtitle ("N problems · M questions").
   */
  problemCount():number {
    return this.targets()
               .filter( t => t.itemType === 'PROBLEM' ).length ;
  }

  /**
   * How many of the current targets are questions — shown in the
   * bulk-mode subtitle.
   */
  questionCount():number {
    return this.targets()
               .filter( t => t.itemType === 'QUESTION' ).length ;
  }

  /**
   * Dialog title: the single target's own label in single mode, or a count
   * summary ("N items selected") in bulk mode.
   */
  dialogTitle():string {
    return this.isSingleMode() ?
      this.targets()[0].displayLabel :
      `${this.targets().length} items selected` ;
  }

  /**
   * The id set of tags to hide from pickers, passed down to `tag-search-box`,
   * `quick-access-tabs` and `browse-by-topic` as their `excludeTagIds` input
   * so a tag that's already applied doesn't also show up as a pickable
   * suggestion/chip/pill.
   *
   * In single mode, derived from {@link attachedTags} (every attached tag).
   * In bulk mode, derived from {@link tagHistogram}, but only tags whose
   * `associationCount` equals the target count — i.e. tags already on *all*
   * selected items. A tag on only *some* of them stays pickable everywhere,
   * since picking it again is exactly how the user completes it to full
   * association (see {@link attachTag}).
   */
  attachedTagIds():Set<number> {
    if( this.isSingleMode() ) {
      return new Set( this.attachedTags.map( t => t.id ) ) ;
    }
    return new Set(
      this.tagHistogram
          .filter( t => t.associationCount === this.targets().length )
          .map( t => t.id )
    ) ;
  }

  /**
   * Flattens {@link syllabus}'s subject → topic tree into a single list of
   * `{id, label}` options (label prefixed with the subject name, e.g.
   * "Physics — Kinematics"), for the create-panel's topic picker, which has
   * no notion of subjects and just needs one flat searchable list. Subjects
   * in {@link EXCLUDED_SUBJECTS} ("Exam", "Reasoning") are left out — they
   * aren't meaningful homes for a concept tag.
   */
  flattenedTopics():TopicOption[] {
    return this.syllabus
      .filter( s => !EXCLUDED_SUBJECTS.includes( s.subjectName ) )
      .flatMap( s =>
        s.topics.map( t => (
          { id: t.id, label: `${s.subjectName} — ${t.topicName}` }
        ) )
      ) ;
  }

  /**
   * Resets and (re)loads everything this dialog session needs, run every
   * time the dialog is opened (see {@link ngOnChanges}).
   *
   * First clears all transient UI state left over from any previous session
   * (create panel, its query/error text, any attach warning, the attached-tag
   * list) so nothing from a prior open leaks into this one. Then fires all
   * four data fetches — syllabus tree, recent tags, most-used tags, and
   * either the single target's currently-attached tags or (bulk mode) the
   * whole selection's tag histogram — concurrently via `Promise.all`, since
   * none of them depend on each other, and assigns the results once every
   * fetch has completed.
   */
  private async onOpen() {
    this.createPanelOpen = false ;
    this.createPanelQuery = "" ;
    this.createError = null ;
    this.lastAttachWarning = null ;
    this.attachedTags = [] ;
    this.tagHistogram = [] ;

    const single = this.isSingleMode() ? this.targets()[0] : null ;

    const [ syllabus, recent, mostUsed, fourth ] = await Promise.all( [
      this.syllabusApi.getAllSyllabus(),
      this.tagApi.getRecentTags(),
      this.tagApi.getMostUsedTags(),
      single
        ? this.tagAssociationApi.getTagsForItem( single.itemType, single.itemId )
        : this.fetchBulkTagHistogram(),
    ] ) ;

    this.syllabus = syllabus ;
    this.recentTags = recent ;
    this.mostUsedTags = mostUsed ;
    if( single ) this.attachedTags = fourth ;
    else this.tagHistogram = fourth ;
  }

  /**
   * Builds the bulk-mode tag histogram: calls
   * `TagAssociationApiService.getTagAssociationHistogram` once per
   * `itemType` group (see {@link targetsByItemType} — normally one call,
   * two only for a mixed problem+question selection), then merges the
   * per-group results by tag id, summing `associationCount` across groups
   * (a tag can legitimately appear in both a problem group and a question
   * group, since the tag catalog isn't itself type-scoped). Sorted by
   * count descending, tagText ascending as a tiebreaker — matching the
   * backend's own per-group ordering, which the merge step can otherwise
   * disturb.
   */
  private async fetchBulkTagHistogram():Promise<TagSO[]> {
    const groups = this.targetsByItemType() ;
    const perGroupLists = await Promise.all(
      groups.map( g => this.tagAssociationApi.getTagAssociationHistogram( g.itemType, g.itemIds ) )
    ) ;

    const merged = new Map<number, TagSO>() ;
    for( const list of perGroupLists ) {
      for( const tag of list ) {
        const existing = merged.get( tag.id ) ;
        if( existing ) existing.associationCount += tag.associationCount ;
        else merged.set( tag.id, { ...tag } ) ;
      }
    }

    return Array.from( merged.values() ).sort( ( a, b ) =>
      b.associationCount - a.associationCount || a.tagText.localeCompare( b.tagText )
    ) ;
  }

  /**
   * Groups {@link targets} by `itemType` into `{itemType, itemIds}` batches
   * — the bulk `addTag` endpoint takes one `itemType` and one `tagId` per
   * call, so a mixed problem+question selection still needs one call per
   * type, just not one call per item.
   */
  private targetsByItemType():{ itemType:TaggableItemType, itemIds:number[] }[] {
    const idsByType = new Map<TaggableItemType, number[]>() ;
    for( const t of this.targets() ) {
      const ids = idsByType.get( t.itemType ) ?? [] ;
      ids.push( t.itemId ) ;
      idsByType.set( t.itemType, ids ) ;
    }
    return Array.from( idsByType, ( [ itemType, itemIds ] ) => ( { itemType, itemIds } ) ) ;
  }

  /**
   * Handles a tag pick — invoked from `(tagSelected)` on `tag-search-box`,
   * `quick-access-tabs` and `browse-by-topic` alike, whichever component the
   * user picked the tag from. Also invoked internally by {@link onCreateAndAttach}
   * right after a brand-new tag is created.
   *
   * Applies the tag to every current target via one bulk `addTag` call per
   * `itemType` group (see {@link targetsByItemType}) — normally just one
   * call, two only for a mixed problem+question bulk selection. Duplicates
   * within a batch are now handled silently by the backend (not rejected),
   * so any rejection here is a genuine failure. Uses `Promise.allSettled`
   * so one group's failure (e.g. a mixed-type selection) doesn't stop the
   * other group from attaching. If every group failed, no local state
   * changes and a failure message is set. Otherwise, local state is updated
   * — in single mode the chip is added to {@link attachedTags}; in bulk mode
   * {@link tagHistogram} is refetched from scratch (the simplest correct way
   * to reflect the new per-tag counts, including a tag that was only
   * partially associated now becoming fully associated) — `tagsChanged`
   * fires so the host can refresh any dependent UI, the usual housekeeping
   * runs ({@link refreshQuickAccessLists} and `browse-by-topic`'s own topic
   * tags via {@link browseByTopicRef}), and a partial-failure warning is set
   * only if some (but not all) groups failed.
   */
  async attachTag( tag:TagSO ) {
    if( this.attachedTagIds().has( tag.id ) ) return ;

    const groups = this.targetsByItemType() ;
    const results = await Promise.allSettled(
      groups.map( g => this.tagAssociationApi.addTag( g.itemType, g.itemIds, tag.id ) )
    ) ;

    const failures = results.filter(
      ( r ):r is PromiseRejectedResult => r.status === 'rejected'
    ) ;

    if( failures.length === results.length ) {
      // Every group failed — don't show the chip as attached.
      this.lastAttachWarning = `Failed to attach "${tag.tagText}": ${failures[0].reason}` ;
      return ;
    }

    if( this.isSingleMode() ) this.attachedTags = [ ...this.attachedTags, tag ] ;
    else this.tagHistogram = await this.fetchBulkTagHistogram() ;

    this.tagsChanged.emit() ;
    this.refreshQuickAccessLists().then() ;
    this.browseByTopicRef.refreshTopicTags() ;
    this.lastAttachWarning = failures.length > 0
      ? `"${tag.tagText}" could not be applied to some of the selected items.`
      : null ;
  }

  /**
   * Invoked by the warning's own dismiss ("x") button — hides it without
   * any other side effect.
   */
  dismissAttachWarning() {
    this.lastAttachWarning = null ;
  }

  /**
   * Re-fetches {@link recentTags}/{@link mostUsedTags} so `quick-access-tabs`
   * reflects the tag's new usage/association-count immediately. Those lists
   * are otherwise only ever loaded once, in {@link onOpen}, so nothing else
   * would refresh them mid-session. Called after a successful attach (see
   * {@link attachTag}) — a fresh attach can change both which tag was most
   * recently used and its association count — and from {@link onTagDeleted}.
   */
  private async refreshQuickAccessLists() {
    const [ recent, mostUsed ] = await Promise.all( [
      this.tagApi.getRecentTags(),
      this.tagApi.getMostUsedTags(),
    ] ) ;
    this.recentTags = recent ;
    this.mostUsedTags = mostUsed ;
  }

  /**
   * Invoked from `(tagDeleted)` on `browse-by-topic` after it deletes a tag
   * (the whole catalog record, not just one association). Refreshes
   * {@link recentTags}/{@link mostUsedTags} so `quick-access-tabs` stops
   * showing it, and — bulk mode only — refetches {@link tagHistogram} too,
   * since the deleted tag could otherwise keep showing there as a dangling
   * pill (clicking it to attach would fail, referencing a tag id that no
   * longer exists).
   */
  async onTagDeleted() {
    await this.refreshQuickAccessLists() ;
    if( !this.isSingleMode() ) this.tagHistogram = await this.fetchBulkTagHistogram() ;
  }

  /**
   * Handles removing an attached tag — invoked from `(close)` on the
   * `closeable-badge` chip in single mode, or a histogram pill's × in bulk
   * mode. Removes the tag from every current target in parallel (via
   * `Promise.all`; unlike {@link attachTag} there's no "already
   * associated"-style benign failure to tolerate here — detach is
   * idempotent-safe by construction, since removing a tag from an item that
   * doesn't have it is a harmless no-op both server-side and here). Updates
   * local state — in single mode, drops it from {@link attachedTags}; in
   * bulk mode, refetches {@link tagHistogram} from scratch — notifies the
   * host via `tagsChanged`, and runs the same housekeeping as
   * {@link attachTag} (quick-access lists, `browse-by-topic`'s topic tags).
   */
  async detachTag( tag:TagSO ) {
    await Promise.all(
      this.targets()
          .map( t =>
            this.tagAssociationApi.removeTag( t.itemType, t.itemId, tag.id )
          )
    ) ;

    if( this.isSingleMode() ) this.attachedTags = this.attachedTags.filter( t => t.id !== tag.id ) ;
    else this.tagHistogram = await this.fetchBulkTagHistogram() ;

    this.tagsChanged.emit() ;
    this.refreshQuickAccessLists().then() ;
    this.browseByTopicRef.refreshTopicTags() ;
  }

  /**
   * Invoked from `(createRequested)` on `tag-search-box`, which fires when
   * the user asks to create a brand-new tag (no exact match found, Enter
   * pressed). Seeds the create panel with the query text that was in the
   * search box and opens it.
   */
  onCreateRequested( query:string ) {
    this.createPanelQuery = query ;
    this.createError = null ;
    this.createPanelOpen = true ;
  }

  /**
   * Invoked from `(escapePressed)` on `tag-search-box` when the user presses
   * Escape in the search field. `tag-search-box` has already cleared its own
   * text by this point; `wasEmpty` tells us whether that text was empty
   * *before* this Escape press.
   *
   * If the box was already empty, there was nothing left for Escape to
   * clear, so this Escape means "leave the dialog entirely" — same as
   * Cancel/Done. Otherwise, the box just had its text cleared; if the
   * create panel happens to be open, this also treats Escape as "cancel
   * create", so one Escape press backs out of the whole search-then-create
   * flow rather than just clearing the search box while leaving the create
   * panel stranded open.
   */
  onSearchEscape( req:{ wasEmpty:boolean } ) {
    if( req.wasEmpty ) {
      this.close() ;
      return ;
    }
    if( this.createPanelOpen ) this.onCreateCancel() ;
  }

  /**
   * Invoked from `(cancel)` on `create-tag-panel` — closes the create flow
   * via {@link closeCreatePanel}.
   */
  onCreateCancel() {
    this.closeCreatePanel() ;
  }

  /**
   * Collapses the create-tag panel, clears any error it was showing, and
   * hands focus back to the search box — clearing its stale query text
   * (from whatever triggered the create) and refocusing it, so the dialog
   * is left ready for the next search rather than stranded on a now-gone
   * button. Shared by all three ways the create flow can end: Create &
   * attach ({@link onCreateAndAttach}), Create ({@link onCreateOnly}), and
   * Cancel ({@link onCreateCancel}).
   */
  private closeCreatePanel() {
    this.createPanelOpen = false ;
    this.createError = null ;
    this.searchBoxRef.clear() ;
    this.searchBoxRef.focusInput() ;
  }

  /**
   * Client-side duplicate-tag guard, run before every create attempt (both
   * "create and attach" and "create only"). Primary defense against
   * duplicate-tag creation — see plan notes on the `RemoteService` HTTP-400
   * message-loss gap for why this check happens here rather than being
   * trusted to the `createTag()` rejection alone (a non-2xx HTTP response
   * from `RemoteService` always surfaces a generic hardcoded error message,
   * discarding the real "duplicate tag" reason the server would have sent).
   *
   * Live-searches for the candidate text and compares each hit's
   * *normalized* form (see `normalizeTagText`) against the candidate's
   * normalized form, so trivial differences (case, punctuation, whitespace)
   * still count as a duplicate. On a match, sets {@link createError} and
   * returns `true` so the caller aborts before ever calling `createTag()`.
   */
  private async checkDuplicateBeforeCreate( tagText:string ):Promise<boolean> {
    const hits = await this.tagApi.searchTags( tagText ) ;
    const dupe = hits.find( t =>
      normalizeTagText( t.tagText ) === normalizeTagText( tagText )
    ) ;

    if( dupe ) {
      this.createError = `A tag matching "${dupe.tagText}" already exists — ` +
                         `pick it from the list instead of creating a new one.` ;
      return true ;
    }
    return false ;
  }

  /**
   * Invoked from `(createAndAttach)` on `create-tag-panel` — the "create and
   * apply this tag" action. Runs the duplicate check first; if that passes,
   * creates the tag under the chosen topic, closes the create panel via
   * {@link closeCreatePanel}, then immediately attaches the freshly-created
   * tag via {@link attachTag} (so it goes through the same multi-target/
   * partial-failure handling as any other tag pick). Any error from
   * `createTag` itself (a real server failure, not a duplicate) is shown
   * inline in the still-open create panel rather than silently closing it.
   */
  async onCreateAndAttach( req:{ tagText:string, topicId:number } ) {
    if( await this.checkDuplicateBeforeCreate( req.tagText ) ) return ;
    try {
      const tag = await this.tagApi.createTag( req.tagText, req.topicId, '#000000' ) ;
      this.closeCreatePanel() ;
      await this.attachTag( tag ) ;
    }
    catch( err ) {
      this.createError = String( err ) ;
    }
  }

  /**
   * Invoked from `(createOnly)` on `create-tag-panel` — "create this tag but
   * don't attach it to anything yet" (e.g. pre-populating the tag catalog
   * under a topic without tagging the current item). Same duplicate-check
   * and error-handling as {@link onCreateAndAttach}, but deliberately skips
   * the attach step.
   */
  async onCreateOnly( req:{ tagText:string, topicId:number } ) {
    if( await this.checkDuplicateBeforeCreate( req.tagText ) ) return ;
    try {
      await this.tagApi.createTag( req.tagText, req.topicId, '#000000' ) ;
      this.closeCreatePanel() ;
    }
    catch( err ) {
      this.createError = String( err ) ;
    }
  }

  /**
   * Invoked from `(hide)`/`(confirm)` on `<modal-dialog>` — fired by its
   * Cancel button, its "Done" confirm button, and its own dismiss ("x")
   * button alike (this widget doesn't distinguish cancel from confirm,
   * since every change is already saved immediately server-side; there is
   * nothing to "commit" on confirm vs. discard on cancel). Simply notifies
   * the host via `closed`; the host is responsible for actually flipping its
   * `show` binding back to `false`.
   */
  close() {
    this.closed.emit() ;
  }

  /**
   * Catch-all Escape handler, bound on `document` rather than this
   * component's own host element. `keydown` only ever fires on whatever
   * element currently has DOM focus, then bubbles *upward* from there — a
   * host-element listener would only catch it while focus is still
   * somewhere inside this dialog's own subtree. Clicking non-focusable
   * content (plain text, the footer, whitespace) shifts focus to
   * `document.body` — an *ancestor* of this host, not a descendant — so a
   * keydown from there would never bubble down into a host-level listener.
   * Listening on `document` instead catches Escape no matter what (if
   * anything) currently has focus. `tag-search-box` and `create-tag-panel`
   * (and the rename input in `browse-by-topic`) each have their own more
   * specific Escape handling and call `event.stopPropagation()`, which still
   * works here — a document listener fires during the bubble phase, so a
   * stopped event never reaches it — so this fallback never double-fires for
   * them; everywhere else in the dialog (quick-access-tabs, browse-by-topic's
   * subject/topic list, the modal's own chrome, plain text/whitespace, etc.)
   * has no Escape handling of its own, so this is what makes Escape close
   * the dialog from anywhere. Guarded on `show()` since a document listener
   * is live even while this dialog instance is closed.
   */
  @HostListener( 'document:keydown.escape' )
  onHostEscape() {
    if( this.show() ) this.close() ;
  }
}
