import { Component, inject, input, output, signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { NgbTooltip, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { getContrastingTextColor } from "lib-core";
import { TagAssociationApiService } from "../../services/tag-association-api.service";
import { TaggableItemType, TagSO } from "../../util/tag-data-types";

// Read-only "which tags does this item have" affordance, shared by every
// host that lists Problems/Questions with a tag column (results-tree,
// problem-history). The icon's glyph/color come from the host's own
// batched TagAssociationApiService.getTagCounts() call (tagCount input) —
// never fetched here, so it can't go stale. The hover tooltip's tag names
// ARE fetched here, via getTagsForItem() (already used by
// tag-association-dialog to pre-populate itself), fresh on every hover and
// never cached — so those can't go stale either, by construction. Opening
// the edit dialog is left to the host (iconClicked output): every host
// already owns one shared tag-association-dialog instance across its
// whole row list, and giving each row its own instance would be wasteful
// for tag-browser's deliberately unpaginated result trees.
@Component({
  selector: 'tag-icon-widget',
  imports: [ NgClass, NgbTooltipModule ],
  templateUrl: './tag-icon-widget.component.html',
  styleUrl: './tag-icon-widget.component.css',
})
export class TagIconWidgetComponent {

  /** Exposed for the template — picks legible text color for a tag.color background. */
  protected readonly getContrastingTextColor = getContrastingTextColor ;

  private tagAssociationApi = inject( TagAssociationApiService ) ;

  itemType = input.required<TaggableItemType>() ;
  itemId = input.required<number>() ;
  tagCount = input.required<number>() ;
  iconClicked = output<void>() ;

  hoveredTags = signal<TagSO[]>( [] ) ;
  loadingTags = signal( false ) ;

  private hoverTimer:ReturnType<typeof setTimeout> | null = null ;

  iconClass():string {
    if( this.tagCount() === 0 ) return 'bi-tag' ;
    if( this.tagCount() === 1 ) return 'bi-tag-fill' ;
    return 'bi-tags-fill' ;
  }

  iconColor():string {
    return this.tagCount() === 0 ? 'grey' : 'blue' ;
  }

  // Debounced so sweeping the mouse across many rows in a large results
  // tree doesn't fire a fetch per row passed over — only rows the user
  // actually pauses on incur a call. Untagged items never fetch at all.
  onMouseEnter( tooltip:NgbTooltip ) {
    if( this.tagCount() === 0 ) return ;
    this.hoverTimer = setTimeout( () => {
      this.loadingTags.set( true ) ;
      this.hoveredTags.set( [] ) ;
      tooltip.open() ;
      this.tagAssociationApi.getTagsForItem( this.itemType(), this.itemId() )
        .then( tags => this.hoveredTags.set( tags ) )
        .finally( () => this.loadingTags.set( false ) ) ;
    }, 180 ) ;
  }

  onMouseLeave( tooltip:NgbTooltip ) {
    if( this.hoverTimer ) {
      clearTimeout( this.hoverTimer ) ;
      this.hoverTimer = null ;
    }
    tooltip.close() ;
  }
}
