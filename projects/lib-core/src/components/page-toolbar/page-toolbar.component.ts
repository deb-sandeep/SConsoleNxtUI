import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'page-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-toolbar.component.html',
  styleUrl: './page-toolbar.component.css'
})
export class PageToolbarComponent {

  @Input( "title" )
  title:string = "" ;
}
