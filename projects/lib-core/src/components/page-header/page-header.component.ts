import { Component, input } from '@angular/core';

@Component( {
  selector: 'page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {

  title = input<string>( "" ) ;
  farRightTitle = input<string>( "" ) ;
}
