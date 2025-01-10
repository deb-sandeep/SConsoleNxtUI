import { Component } from '@angular/core';
import { PageToolbarActionItemMeta, PageToolbarComponent } from "lib-core";
import { environment } from "projects/environments/environment";
import { APIResponse } from "lib-core";
import { HttpClient } from "@angular/common/http";


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
    { type: 'button', iconName: 'upload', name: 'File upload', style: 'secondary', targetObj: this, action:this.fileSelectedForValidation },
  ] ;

  constructor( private http:HttpClient ) {
    console.log( "Injected with http " + http ) ;
  }

  fileSelectedForValidation() {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;

    console.log( 'Uploading file to ' + uploadUrl ) ;
    console.log( 'This = ' + this ) ;

    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = false ;
    input.accept = '.yaml' ;
    input.addEventListener( 'change', function( e:Event ){

      const files:FileList|null = (e.target as HTMLInputElement).files ;
      const formData = new FormData() ;
      formData.append( 'file', files!.item(0) as File ) ;

      console.log( "Posting to server." ) ;
      /*
      http.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {},
            error: err => {}
          } ) ;*/

    } ) ;
    input.click() ;
  }
}
