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

  fileToUpload:File | null = null ;

  fileUpload() {
    console.log( 'Uploading file.' ) ;
    const input:HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt'
    input.addEventListener( 'change', function(e:Event){
      console.log( "Got the click event" ) ;
      console.log( (e.target as HTMLInputElement).files ) ;
    } ) ;
    input.click();
  }

}
