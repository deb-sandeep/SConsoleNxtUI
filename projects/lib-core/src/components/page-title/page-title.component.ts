import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {PageTitleService} from "./page-title.service";

@Component({
  selector: 'page-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-toolbar">
      {{pageTitle}}{{additionalTitle}}
      <div class="action-btns">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: `
    .page-toolbar {
        display: block;
        width: calc(100vw - var(--feature-menubar-width));
        height: var(--page-toolbar-height);
        background-color: var(--page-toolbar-bgcolor);
        color: var(--page-toolbar-fgcolor) ;
        font-size: 18px;
        padding-left: 10px;
    }
    
    .action-btns {
        float:right ;
        padding-left: 10px ;
        padding-right: 10px ;
    }
  `
})
export class PageTitleComponent {

  pageTitle:string = "" ;
  additionalTitle:string = "" ;

  constructor( private router: Router,
               private activatedRoute: ActivatedRoute,
               private toolbarTitleSvc: PageTitleService ) {

    router.events.subscribe( e => {
      if( e instanceof NavigationStart ) {
        this.additionalTitle = "" ;
      }
      else if( e instanceof NavigationEnd ) {
        this.pageTitle = activatedRoute.snapshot.firstChild?.title || "" ;
      }
    } ) ;

    toolbarTitleSvc.title$.subscribe( title => {
      this.additionalTitle = ( title === "" ) ? "" : ` > ${title}` ;
    }) ;
  }
}
