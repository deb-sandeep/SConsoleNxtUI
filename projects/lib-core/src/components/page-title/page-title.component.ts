import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {PageTitleService} from "./page-title.service";

@Component({
    selector: 'page-title',
    imports: [CommonModule],
    template: `
    <div class="page-title">
      {{pageTitle}}{{additionalTitle}}
    </div>
  `,
    styles: `
      .page-title {
          display: block;
          width: calc(100vw - var(--feature-menubar-width));
          height: var(--page-title-height);
          background-color: var(--page-title-bgcolor);
          color: var(--page-title-fgcolor);
          font-size: 18px;
          padding-left: 10px;
          border-top: 1px solid var(--page-toolbar-bgcolor);
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
