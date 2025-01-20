import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import {ActivatedRoute, NavigationEnd, NavigationStart, Router} from '@angular/router';
import {ToolbarTitleService} from "./toolbar-title.service";

@Component({
  selector: 'page-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-toolbar.component.html',
  styleUrl: './page-toolbar.component.css'
})
export class PageToolbarComponent {

  pageTitle:string = "" ;
  additionalTitle:string = "" ;

  constructor( private router: Router,
               private activatedRoute: ActivatedRoute,
               private toolbarTitleSvc: ToolbarTitleService ) {

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
