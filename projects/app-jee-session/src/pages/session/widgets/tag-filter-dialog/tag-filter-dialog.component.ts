import { Component, input, output } from '@angular/core';
import { NgClass } from "@angular/common";
import { TagSO } from "@jee-common/util/tag-data-types";

@Component({
  selector: 'tag-filter-dialog',
  imports: [
    NgClass
  ],
  templateUrl: './tag-filter-dialog.component.html',
  styleUrl: './tag-filter-dialog.component.css',
})
export class TagFilterDialogComponent {

  tags = input.required<TagSO[]>() ;
  // Tags per problem id, for the same problem set `tags` was drawn from -
  // used to compute a live "N of M problems match" preview as the student
  // toggles checkboxes, without touching the actual session state (a
  // scratch filter, applied only when Apply is clicked).
  problemTagsMap = input.required<Record<number, TagSO[]>>() ;

  hide = output<void>() ;
  applyFilter = output<TagSO[]>() ;

  selected: Record<number, boolean> = {} ;

  toggleTag( tagId: number ) {
    this.selected[ tagId ] = !this.selected[ tagId ] ;
  }

  anyTagSelected() {
    return Object.values( this.selected ).some( v => v ) ;
  }

  totalProblemCount() {
    return Object.keys( this.problemTagsMap() ).length ;
  }

  // Same "has at least one of the selected tags" (OR) match rule as
  // Session.applyProblemTagFilter, so this preview matches what Apply
  // would actually produce.
  matchingProblemCount() {
    const selectedTagIds = this.tags()
      .filter( t => this.selected[ t.id ] )
      .map( t => t.id ) ;
    if( selectedTagIds.length === 0 ) {
      return 0 ;
    }
    const selectedTagIdSet = new Set( selectedTagIds ) ;
    return Object.values( this.problemTagsMap() )
      .filter( problemTags => problemTags.some( t => selectedTagIdSet.has( t.id ) ) )
      .length ;
  }

  confirmClicked() {
    const chosen = this.tags().filter( t => this.selected[ t.id ] ) ;
    this.applyFilter.emit( chosen ) ;
  }
}
