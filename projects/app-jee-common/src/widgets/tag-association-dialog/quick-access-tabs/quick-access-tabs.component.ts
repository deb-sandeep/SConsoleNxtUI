import { Component, input, output } from '@angular/core';
import { TagSO } from "@jee-common/util/tag-data-types";

@Component({
  selector: 'quick-access-tabs',
  imports: [],
  templateUrl: './quick-access-tabs.component.html',
  styleUrl: './quick-access-tabs.component.css'
})
/**
 * Two-tab shortcut strip ("Recently used" / "Frequently used") for quickly
 * picking a tag without searching or browsing — both lists are supplied
 * pre-fetched by the host (server-ranked top-10s), this component only owns
 * which tab is active and filters out already-attached tags.
 */
export class QuickAccessTabsComponent {

  /**
   * The 10 most recently created/used tags, server-ranked — shown under
   * the "Recently used" tab.
   */
  recentTags = input<TagSO[]>( [] ) ;
  /**
   * The 10 tags with the highest association counts, server-ranked — shown
   * under the "Frequently used" tab.
   */
  mostUsedTags = input<TagSO[]>( [] ) ;
  /**
   * Tag ids to hide from both lists — the tags already attached to the
   * current target(s).
   */
  excludeTagIds = input<Set<number>>( new Set() ) ;

  /** Emitted when the user clicks a tag chip in whichever tab is active. */
  tagSelected = output<TagSO>() ;

  /**
   * Which tab is currently showing; always starts on "recent" for a
   * freshly-opened dialog session (this component is destroyed/recreated
   * on every dialog open, so this field's initializer is what resets it —
   * see the widget-level class doc on `TagAssociationDialogComponent`).
   */
  activeTab:'recent' | 'frequent' = 'recent' ;

  /**
   * The tag list for whichever tab is active, with already-attached tags
   * filtered out.
   */
  visibleTags():TagSO[] {
    const source = this.activeTab === 'recent' ? this.recentTags() : this.mostUsedTags() ;
    return source.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  /**
   * Invoked when a tab header is clicked — switches which list
   * {@link visibleTags} reads from.
   */
  selectTab( tab:'recent' | 'frequent' ) {
    this.activeTab = tab ;
  }
}
