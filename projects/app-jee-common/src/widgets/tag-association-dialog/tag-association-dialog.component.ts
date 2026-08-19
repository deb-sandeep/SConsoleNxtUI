import { Component, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { CloseableBadgeComponent, ModalDialogComponent } from "lib-core";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { TagAssociationApiService } from "@jee-common/services/tag-association-api.service";
import { SyllabusApiService } from "@jee-common/services/syllabus-api.service";
import { SyllabusSO } from "@jee-common/util/master-data-types";
import { normalizeTagText, TagAssociationTarget, TagSO } from "@jee-common/util/tag-data-types";
import { TagSearchBoxComponent } from "./tag-search-box/tag-search-box.component";
import { CreateTagPanelComponent, TopicOption } from "./create-tag-panel/create-tag-panel.component";
import { QuickAccessTabsComponent } from "./quick-access-tabs/quick-access-tabs.component";
import { BrowseByTopicComponent } from "./browse-by-topic/browse-by-topic.component";

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
   * Whether the current create-panel session should bypass the
   * duplicate-tag guard — set from the `forced` flag on a `createRequested`
   * event (Shift+Enter in `tag-search-box`), which means the user
   * deliberately chose to create a near-duplicate. Read by
   * {@link checkDuplicateBeforeCreate}.
   */
  createForced = false ;

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
   * The id set of currently-attached tags, derived from {@link attachedTags}.
   * Passed down to `tag-search-box`, `quick-access-tabs` and `browse-by-topic`
   * as their `excludeTagIds` input so a tag that's already applied doesn't
   * also show up as a pickable suggestion/chip/pill.
   */
  attachedTagIds():Set<number> {
    return new Set( this.attachedTags.map( t => t.id ) ) ;
  }

  /**
   * Flattens {@link syllabus}'s subject → topic tree into a single list of
   * `{id, label}` options (label prefixed with the subject name, e.g.
   * "Physics — Kinematics"), for the create-panel's topic picker, which has
   * no notion of subjects and just needs one flat searchable list.
   */
  flattenedTopics():TopicOption[] {
    return this.syllabus.flatMap( s =>
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
   * four data fetches — syllabus tree, recent tags, most-used tags, and (in
   * single mode only) the target's currently-attached tags — concurrently via
   * `Promise.all`, since none of them depend on each other, and assigns the
   * results once every fetch has completed.
   */
  private async onOpen() {
    this.createPanelOpen = false ;
    this.createPanelQuery = "" ;
    this.createForced = false ;
    this.createError = null ;
    this.lastAttachWarning = null ;
    this.attachedTags = [] ;

    const single = this.isSingleMode() ? this.targets()[0] : null ;

    const [ syllabus, recent, mostUsed, attached ] = await Promise.all( [
      this.syllabusApi.getAllSyllabus(),
      this.tagApi.getRecentTags(),
      this.tagApi.getMostUsedTags(),
      single
        ? this.tagAssociationApi.getTagsForItem( single.itemType, single.itemId )
        : Promise.resolve<TagSO[]>( [] ),
    ] ) ;

    this.syllabus = syllabus ;
    this.recentTags = recent ;
    this.mostUsedTags = mostUsed ;
    this.attachedTags = attached ;
  }

  /**
   * Handles a tag pick — invoked from `(tagSelected)` on `tag-search-box`,
   * `quick-access-tabs` and `browse-by-topic` alike, whichever component the
   * user picked the tag from. Also invoked internally by {@link onCreateAndAttach}
   * right after a brand-new tag is created.
   *
   * Applies the tag to every current target in parallel via `Promise.allSettled`
   * (not `Promise.all`) because in bulk mode some targets may already have
   * this tag attached — the backend rejects that as a functional error
   * ("already associated"), which we treat as a benign no-op rather than a
   * real failure. Only failures whose message does NOT contain "already
   * associated" count as `realFailures`. If every single target failed for a
   * real reason, the tag is not added to {@link attachedTags} (the chip won't
   * show as attached) and a failure message is set. If at least one target
   * succeeded, the chip is shown, `tagsChanged` fires so the host can refresh
   * any dependent UI, and a partial-failure warning is set only if some (but
   * not all) targets failed.
   */
  async attachTag( tag:TagSO ) {
    if( this.attachedTagIds().has( tag.id ) ) return ;

    const results = await Promise.allSettled(
      this.targets().map( t =>
        this.tagAssociationApi.addTag( t.itemType, t.itemId, tag.id )
      )
    ) ;

    const realFailures =
      results.filter( ( r ):r is PromiseRejectedResult =>
        r.status === 'rejected' &&
        !String( r.reason ).includes( 'already associated' )
      ) ;

    if( realFailures.length === results.length ) {
      // Every item failed for a real reason — don't show the chip as attached.
      this.lastAttachWarning = `Failed to attach "${tag.tagText}": ${realFailures[0].reason}` ;
      return ;
    }

    this.attachedTags = [ ...this.attachedTags, tag ] ;
    this.tagsChanged.emit() ;
    this.lastAttachWarning = realFailures.length > 0
      ? `"${tag.tagText}" could not be applied to ${realFailures.length} of ${results.length} item(s).`
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
   * Handles removing an attached tag — invoked from `(close)` on the
   * `closeable-badge` chip in the attached-tags row. Removes the tag from
   * every current target in parallel (via `Promise.all`; unlike
   * {@link attachTag} there's no "already associated"-style benign failure
   * case to tolerate here — detach is idempotent-safe by construction, since
   * every target passed in is one this tag is actually attached to), then
   * drops it from the local {@link attachedTags} list and notifies the host
   * via `tagsChanged`.
   */
  async detachTag( tag:TagSO ) {
    await Promise.all(
      this.targets()
          .map( t =>
            this.tagAssociationApi.removeTag( t.itemType, t.itemId, tag.id )
          )
    ) ;
    this.attachedTags = this.attachedTags.filter( t => t.id !== tag.id ) ;
    this.tagsChanged.emit() ;
  }

  /**
   * Invoked from `(createRequested)` on `tag-search-box`, which fires when
   * the user asks to create a brand-new tag (no exact match found, Enter
   * pressed; or Shift+Enter to force-create even when an exact match exists).
   * Seeds the create panel with the query text that was in the search box
   * and opens it.
   */
  onCreateRequested( req:{ query:string, forced:boolean } ) {
    this.createPanelQuery = req.query ;
    this.createForced = req.forced ;
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
   * Invoked from `(cancel)` on `create-tag-panel` — collapses the panel and
   * clears any error it was showing.
   */
  onCreateCancel() {
    this.createPanelOpen = false ;
    this.createForced = false ;
    this.createError = null ;
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
   *
   * Skipped entirely when {@link createForced} is set — the user already
   * chose, via Shift+Enter, to create the tag even over an exact match.
   */
  private async checkDuplicateBeforeCreate( tagText:string ):Promise<boolean> {
    if( this.createForced ) return false ;
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
   * creates the tag under the chosen topic, closes the create panel, then
   * immediately attaches the freshly-created tag via {@link attachTag} (so it
   * goes through the same multi-target/partial-failure handling as any other
   * tag pick). Any error from `createTag` itself (a real server failure, not
   * a duplicate) is shown inline in the still-open create panel rather than
   * silently closing it.
   */
  async onCreateAndAttach( req:{ tagText:string, topicId:number } ) {
    if( await this.checkDuplicateBeforeCreate( req.tagText ) ) return ;
    try {
      const tag = await this.tagApi.createTag( req.tagText, req.topicId ) ;
      this.createPanelOpen = false ;
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
      await this.tagApi.createTag( req.tagText, req.topicId ) ;
      this.createPanelOpen = false ;
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
}
