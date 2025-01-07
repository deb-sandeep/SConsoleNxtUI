import { Component } from '@angular/core';
import {PageToolbarActionItemMeta, PageToolbarComponent} from "lib-core";

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [PageToolbarComponent],
  templateUrl: './manage-books.component.html',
  styleUrl: './manage-books.component.css'
})
export class ManageBooksComponent {

  title:string = 'Book summary' ;
  pageMenuItems:PageToolbarActionItemMeta[] = [
    { type: 'button', iconName: 'upload', name:'File upload', style:'secondary', action:this.fileUpload },
  ]

  fileUpload() {
    console.log( 'Uploading file.' ) ;
  }
}
