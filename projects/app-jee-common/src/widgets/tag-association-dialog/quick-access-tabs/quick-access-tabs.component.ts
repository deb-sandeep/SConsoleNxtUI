import { Component, input, output } from '@angular/core';
import { TagSO } from "@jee-common/util/tag-data-types";

@Component({
  selector: 'quick-access-tabs',
  imports: [],
  templateUrl: './quick-access-tabs.component.html',
  styleUrl: './quick-access-tabs.component.css'
})
export class QuickAccessTabsComponent {

  recentTags = input<TagSO[]>( [] ) ;
  mostUsedTags = input<TagSO[]>( [] ) ;
  excludeTagIds = input<Set<number>>( new Set() ) ;

  tagSelected = output<TagSO>() ;

  activeTab:'recent' | 'frequent' = 'recent' ;

  visibleTags():TagSO[] {
    const source = this.activeTab === 'recent' ? this.recentTags() : this.mostUsedTags() ;
    return source.filter( t => !this.excludeTagIds().has( t.id ) ) ;
  }

  selectTab( tab:'recent' | 'frequent' ) {
    this.activeTab = tab ;
  }
}
