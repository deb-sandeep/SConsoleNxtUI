import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule } from "@angular/forms";

export type TopicOption = { id:number, label:string } ;

@Component({
  selector: 'create-tag-panel',
  imports: [ FormsModule ],
  templateUrl: './create-tag-panel.component.html',
  styleUrl: './create-tag-panel.component.css'
})
/**
 * Inline "create a new tag" sub-panel: shows the tag text (read-only, fixed
 * by whatever the user typed into the search box) alongside a searchable
 * topic picker, and two confirm actions ("create and attach" / "create
 * only"). Purely a form — it never calls the tag API itself; every action
 * is emitted for the host ({@link TagAssociationDialogComponent}) to execute.
 */
export class CreateTagPanelComponent implements OnInit {

  /**
   * The tag text to create, carried over verbatim from the search box —
   * this panel doesn't let the user edit it.
   */
  query = input.required<string>() ;
  /**
   * Flattened `{id, label}` topic list to pick a home topic from — see
   * `flattenedTopics()` on the host.
   */
  topics = input<TopicOption[]>( [] ) ;
  /**
   * Topic id to pre-select when the panel first opens (typically the topic
   * of the item being tagged), if present in {@link topics}.
   */
  defaultTopicId = input<number | undefined>() ;
  /**
   * Error text to show at the bottom of the panel (duplicate-tag warning or
   * a create-API failure), or null when there's nothing to show.
   */
  errorMessage = input<string | null>( null ) ;

  /**
   * Emitted when the user confirms "create and attach this tag to the
   * current target(s)".
   */
  createAndAttach = output<{ tagText:string, topicId:number }>() ;
  /** Emitted when the user confirms "create this tag but don't attach it yet". */
  createOnly = output<{ tagText:string, topicId:number }>() ;
  /**
   * Emitted when the user backs out of the panel (Escape, or a cancel
   * action in the template) without creating anything.
   */
  cancel = output<void>() ;

  /**
   * Text currently typed into the topic-picker's own filter field; starts
   * pre-filled with the default topic's label (see {@link ngOnInit}) and is
   * cleared on first focus (see {@link onTopicPickerFocus}) so typing
   * starts a fresh filter.
   */
  topicPickerQuery = "" ;
  /**
   * The topic id that will actually be sent on create — kept separate from
   * {@link topicPickerQuery} (which is just the picker's free-text filter)
   * since the two can diverge while the user is typing to filter.
   */
  selectedTopicId:number | null = null ;

  /**
   * Whether the topic-picker field has been focused at least once since the
   * panel opened — see {@link onTopicPickerFocus}.
   */
  private topicPickerTouched = false ;

  /**
   * Angular lifecycle callback — invoked once, after this component's inputs
   * are first bound (i.e. right when the panel opens, since it's only ever
   * instantiated inside the host's `@if( createPanelOpen )` block).
   * Pre-selects {@link defaultTopicId} if it's present in {@link topics},
   * otherwise falls back to the first topic in the list, and seeds the
   * picker's filter field with that topic's label so the field starts
   * showing a sensible value rather than empty.
   */
  ngOnInit() {
    const current = this.topics().find( t => t.id === this.defaultTopicId() ) ?? this.topics()[0] ;
    if( current ) {
      this.selectedTopicId = current.id ;
      this.topicPickerQuery = current.label ;
    }
  }

  /**
   * Topics whose label contains the current (case-insensitive)
   * {@link topicPickerQuery} text — the full list when the query is empty.
   */
  filteredTopics():TopicOption[] {
    const q = this.topicPickerQuery.trim().toLowerCase() ;
    if( q.length === 0 ) return this.topics() ;
    return this.topics().filter( t => t.label.toLowerCase().includes( q ) ) ;
  }

  /**
   * Invoked when a row in the topic-picker dropdown is clicked — commits
   * that topic as the selection and fills the picker field with its label.
   */
  selectTopic( t:TopicOption ) {
    this.selectedTopicId = t.id ;
    this.topicPickerQuery = t.label ;
  }

  /**
   * Invoked on `(focus)` of the topic-picker input. Clear the pre-filled
   * topic label the first time the user focuses the field, so typing starts
   * a fresh filter instead of appending to it — otherwise the user would
   * have to manually delete the pre-filled label before they could type a
   * different search term. Only fires this clear once per panel session (via
   * {@link topicPickerTouched}), so re-focusing the field later (e.g. after
   * already picking a topic) doesn't blow away their choice.
   */
  onTopicPickerFocus() {
    if( !this.topicPickerTouched ) {
      this.topicPickerQuery = "" ;
      this.topicPickerTouched = true ;
    }
  }

  /**
   * Invoked on every keystroke in the topic-picker field — updates the
   * filter text and marks the field as touched (so
   * {@link onTopicPickerFocus} won't later clear whatever the user typed).
   */
  onTopicPickerQueryChange( value:string ) {
    this.topicPickerQuery = value ;
    this.topicPickerTouched = true ;
  }

  /**
   * Invoked by the "Create & attach" button — emits {@link createAndAttach}
   * with the current query text and selected topic. No-ops if no topic is
   * selected (e.g. an empty topic list).
   */
  confirmCreateAndAttach() {
    if( this.selectedTopicId == null ) return ;
    this.createAndAttach.emit( { tagText: this.query(), topicId: this.selectedTopicId } ) ;
  }

  /**
   * Invoked by the "Create only" button — emits {@link createOnly} with the
   * current query text and selected topic. No-ops if no topic is selected.
   */
  confirmCreateOnly() {
    if( this.selectedTopicId == null ) return ;
    this.createOnly.emit( { tagText: this.query(), topicId: this.selectedTopicId } ) ;
  }

  /**
   * Invoked on `(keydown.escape)` anywhere in the panel — just forwards the
   * cancel request to the host.
   */
  onEscape() {
    this.cancel.emit() ;
  }
}
