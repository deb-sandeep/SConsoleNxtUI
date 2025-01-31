import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";

export type FeatureMenuItemMeta = {
  iconName : string ;
  routePath : string ;
  selected : boolean ;
}

@Component({
    selector: 'feature-menubar',
    imports: [CommonModule, RouterLink],
    templateUrl: './feature-menubar.component.html',
    styleUrl: './feature-menubar.component.css'
})
export class FeatureMenubarComponent {

  @Input( "meta" )
  public menuitemMetaList:FeatureMenuItemMeta[] = [];

  featureIconClicked( meta : FeatureMenuItemMeta ): void {
    this.menuitemMetaList.forEach( meta => meta.selected = false )
    meta.selected = true ;
  }
}
