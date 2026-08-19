import { AfterViewInit, Component, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { TagApiService } from "@jee-common/services/tag-api.service";
import { normalizeTagText, TagSO } from "@jee-common/util/tag-data-types";

const SEARCH_DEBOUNCE_MS = 280 ;

@Component({
  selector: 'tag-search-box',
  imports: [ FormsModule ],
  templateUrl: './tag-search-box.component.html',
  styleUrl: './tag-search-box.component.css'
})
/**
 * Live tag-search input with keyboard-driven suggestion picking and a
 * "create new tag" fallback. Purely presentational/interaction logic — it
 * has no notion of "attach"; picking or creating a tag just emits an event
 * for the host ({@link TagAssociationDialogComponent}) to act on.
 */
export class TagSearchBoxComponent implements AfterViewInit {

  /**
   * Used only for live-searching matching tags as the user types — see
   * {@link runSearch}.
   */
  private tagApi = inject( TagApiService ) ;

  /**
   * Reference to the native search `<input>`, used by {@link ngAfterViewInit}
   * to autofocus it as soon as this component is created.
   */
  @ViewChild( 'searchInputEl' ) searchInputRef!:ElementRef<HTMLInputElement> ;

  /**
   * Tag ids to hide from the suggestion dropdown — normally the tags
   * already attached to the current target(s), so they don't show up as
   * pickable again.
   */
  excludeTagIds = input<Set<number>>( new Set() ) ;

  /**
   * Input placeholder text; overridden by the host to phrase single- vs.
   * bulk-mode differently.
   */
  placeholder = input( 'Search or create a tag…' ) ;

  /**
   * Emitted when the user picks an existing tag, either by click or via
   * Enter/highlighted-row selection.
   */
  tagSelected = output<TagSO>() ;

  /**
   * Emitted when the user asks to create a new tag — via the "create" row,
   * plain Enter with no exact match, or Shift+Enter to force-create even
   * over an exact match (`forced: true`).
   */
  createRequested = output<{ query:string, forced:boolean }>() ;

  /**
   * Emitted when Escape is pressed, after this component has already
   * cleared its own query/results — lets the host also close anything it
   * opened in response to a create request (see `onSearchEscape` on the
   * host).
   */
  escapePressed = output<void>() ;

  /**
   * The raw text currently typed into the input; also what's echoed to
   * `createRequested`/pre-filled into the create panel.
   */
  query = "" ;

  /**
   * The current suggestion list from the last completed search, already
   * filtered against {@link excludeTagIds}.
   */
  results:TagSO[] = [] ;

  /**
   * Index into {@link results} of the keyboard-highlighted row, or -1 when
   * nothing is highlighted (arrow keys wrap around this list; Enter with no
   * highlight defaults to row 0).
   */
  highlightedIndex = -1 ;

  /**
   * Pending debounce timer for the in-flight keystroke, so a fast typist
   * only triggers one search per pause rather than one per keystroke.
   */
  private debounceHandle:ReturnType<typeof setTimeout> | null = null ;

  /**
   * Monotonically-increasing counter used to discard stale search
   * responses — see {@link runSearch}.
   */
  private searchSeq = 0 ;

  /**
   * Angular lifecycle callback — invoked once, right after this component's
   * view (and thus {@link searchInputRef}) has been created. Since the host
   * (`tag-association-dialog`) destroys and recreates this whole component
   * on every dialog open (see the class doc on `TagAssociationDialogComponent`),
   * this fires fresh every time the dialog opens, giving the search box
   * focus automatically without the host needing to do anything.
   */
  ngAfterViewInit() {
    this.searchInputRef.nativeElement.focus() ;
  }

  /**
   * Invoked on every keystroke via `(ngModelChange)` on the search input.
   * Updates {@link query}, clears any keyboard highlight (the old highlight
   * index may no longer make sense once the result set changes), and
   * (re)schedules a debounced search after {@link SEARCH_DEBOUNCE_MS} of
   * typing inactivity. Clearing the field back to empty short-circuits
   * straight to an empty result set with no server round-trip.
   */
  onQueryChange( value: string ) {
    this.query = value ;
    this.highlightedIndex = -1 ;

    if( this.debounceHandle ) clearTimeout( this.debounceHandle ) ;

    const trimmed = value.trim() ;
    if( trimmed.length === 0 ) {
      this.results = [] ;
      return ;
    }
    this.debounceHandle = setTimeout( () =>
      this.runSearch( trimmed ), SEARCH_DEBOUNCE_MS
    ) ;
  }

  /**
   * Fires the actual search API call once the debounce timer elapses.
   * Tags a sequence number onto this specific call before awaiting the
   * response; if {@link searchSeq} has moved on by the time the response
   * arrives (a newer keystroke started a subsequent search in the meantime),
   * this stale response is discarded rather than overwriting {@link results}
   * with out-of-date data — a network reordering guard, since responses
   * aren't guaranteed to arrive in the order the requests were sent.
   */
  private async runSearch( text:string ) {
    const mySeq = ++this.searchSeq ;
    const hits = await this.tagApi.searchTags( text ) ;
    // a newer search has since superseded this one
    if( mySeq !== this.searchSeq ) return ;
    this.results = hits.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  /**
   * Whether {@link results} already contains a tag whose normalized text
   * exactly matches the current (normalized) query — used to decide
   * whether to show the "create new" row at all.
   */
  hasExactMatch():boolean {
    const norm = normalizeTagText( this.query ) ;
    return this.results.some( t => normalizeTagText( t.tagText ) === norm ) ;
  }

  /**
   * Whether to render the "create new tag" row below the suggestions —
   * shown whenever there's a non-empty query with no exact existing match.
   */
  showCreateRow():boolean {
    return this.query.trim().length > 0 && !this.hasExactMatch() ;
  }

  /**
   * Invoked when a suggestion row is clicked, or selected via Enter —
   * emits the pick and clears the box for the next search.
   */
  selectSuggestion( tag:TagSO ) {
    this.tagSelected.emit( tag ) ;
    this.clear() ;
  }

  /**
   * Resets the box to its empty state: clears the query, results,
   * keyboard highlight, and cancels any pending debounced search.
   */
  clear() {
    this.query = "" ;
    this.results = [] ;
    this.highlightedIndex = -1 ;
    if( this.debounceHandle ) clearTimeout( this.debounceHandle ) ;
  }

  /**
   * Invoked on `(keydown.arrowdown)` — moves the keyboard highlight one row
   * down, wrapping from the last row back to the first. No-op when there
   * are no results.
   */
  onArrowDown() {
    const max = this.results.length - 1 ;
    if( max < 0 ) return ;
    this.highlightedIndex = this.highlightedIndex >= max ? 0 : this.highlightedIndex + 1 ;
  }

  /**
   * Invoked on `(keydown.arrowup)` — moves the keyboard highlight one row
   * up, wrapping from the first row back to the last. No-op when there are
   * no results.
   */
  onArrowUp() {
    const max = this.results.length - 1 ;
    if( max < 0 ) return ;
    this.highlightedIndex = this.highlightedIndex <= 0 ? max : this.highlightedIndex - 1 ;
  }

  /**
   * Invoked on `(keydown.enter)`. Always prevents the default (form submit)
   * behaviour first. Shift+Enter is a "force create" shortcut — it always
   * requests tag creation with `forced: true` regardless of whether a
   * matching suggestion exists, letting a user deliberately create a
   * near-duplicate if they really mean to. Plain Enter instead prefers an
   * existing match: if there are suggestions, it picks the highlighted one
   * (or the first one, if none is highlighted); only when there are no
   * suggestions at all does it fall through to requesting creation
   * (`forced: false`).
   */
  onEnter( event:KeyboardEvent ) {
    event.preventDefault() ;
    if( event.shiftKey ) {
      this.createRequested.emit( { query: this.query, forced: true } ) ;
      return ;
    }
    if( this.results.length > 0 ) {
      const idx = this.highlightedIndex >= 0 ? this.highlightedIndex : 0 ;
      this.selectSuggestion( this.results[idx] ) ;
    }
    else if( this.query.trim().length > 0 ) {
      this.createRequested.emit( { query: this.query, forced: false } ) ;
    }
  }

  /**
   * Invoked on `(keydown.escape)` — clears the box locally, then notifies
   * the host in case it needs to react too (e.g. also closing the create
   * panel).
   */
  onEscape() {
    this.clear() ;
    this.escapePressed.emit() ;
  }
}
