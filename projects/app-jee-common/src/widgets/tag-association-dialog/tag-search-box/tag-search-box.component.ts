import { Component, inject, input, output } from '@angular/core';
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
export class TagSearchBoxComponent {

  private tagApi = inject( TagApiService ) ;

  excludeTagIds = input<Set<number>>( new Set() ) ;
  placeholder = input( 'Search or create a tag…' ) ;

  tagSelected = output<TagSO>() ;
  createRequested = output<{ query:string, forced:boolean }>() ;
  escapePressed = output<void>() ;

  query = "" ;
  results:TagSO[] = [] ;
  highlightedIndex = -1 ;

  private debounceHandle:ReturnType<typeof setTimeout> | null = null ;
  private searchSeq = 0 ;

  onQueryChange( value:string ) {
    this.query = value ;
    this.highlightedIndex = -1 ;

    if( this.debounceHandle ) clearTimeout( this.debounceHandle ) ;

    const trimmed = value.trim() ;
    if( trimmed.length === 0 ) {
      this.results = [] ;
      return ;
    }
    this.debounceHandle = setTimeout( () => this.runSearch( trimmed ), SEARCH_DEBOUNCE_MS ) ;
  }

  private async runSearch( text:string ) {
    const mySeq = ++this.searchSeq ;
    const hits = await this.tagApi.searchTags( text ) ;
    if( mySeq !== this.searchSeq ) return ; // a newer search has since superseded this one
    this.results = hits.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  hasExactMatch():boolean {
    const norm = normalizeTagText( this.query ) ;
    return this.results.some( t => normalizeTagText( t.tagText ) === norm ) ;
  }

  showCreateRow():boolean {
    return this.query.trim().length > 0 && !this.hasExactMatch() ;
  }

  selectSuggestion( tag:TagSO ) {
    this.tagSelected.emit( tag ) ;
    this.clear() ;
  }

  clear() {
    this.query = "" ;
    this.results = [] ;
    this.highlightedIndex = -1 ;
    if( this.debounceHandle ) clearTimeout( this.debounceHandle ) ;
  }

  onArrowDown() {
    const max = this.results.length - 1 ;
    if( max < 0 ) return ;
    this.highlightedIndex = this.highlightedIndex >= max ? 0 : this.highlightedIndex + 1 ;
  }

  onArrowUp() {
    const max = this.results.length - 1 ;
    if( max < 0 ) return ;
    this.highlightedIndex = this.highlightedIndex <= 0 ? max : this.highlightedIndex - 1 ;
  }

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

  onEscape() {
    this.clear() ;
    this.escapePressed.emit() ;
  }
}
