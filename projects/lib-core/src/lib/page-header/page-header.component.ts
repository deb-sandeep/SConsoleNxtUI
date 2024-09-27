import { Component, Input } from '@angular/core';

@Component({
  selector: 'page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  @Input( "title" )
  title:string = "" ;
}
