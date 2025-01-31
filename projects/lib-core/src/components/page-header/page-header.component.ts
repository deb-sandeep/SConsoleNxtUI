import { Component, Input } from '@angular/core';

@Component( {
  selector: 'page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  standalone: true,
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  @Input( "title" )
  title:string = "" ;
}
