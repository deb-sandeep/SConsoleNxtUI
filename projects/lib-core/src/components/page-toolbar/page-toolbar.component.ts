import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'page-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-toolbar.component.html',
  styleUrl: './page-toolbar.component.css'
})
export class PageToolbarComponent {

  title:string = "" ;

  constructor( private router: Router, private activatedRoute: ActivatedRoute ) {
    router.events.subscribe( e => {
      if( e instanceof NavigationEnd ) {
        this.title = activatedRoute.snapshot.firstChild?.title || "" ;
      }
    } ) ;
  }
}
