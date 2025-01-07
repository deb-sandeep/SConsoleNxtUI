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
    { type: 'upload', action:this.fileUpload, data: { accept:'*.yaml'} },
  ]

  fileUpload() {
    console.log( 'Uploading file result received.' ) ;
  }
}
