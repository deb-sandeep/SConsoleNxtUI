import {Component, Host} from '@angular/core';
import { Alert, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent } from "lib-core";
import { environment } from "projects/environments/environment";
import { APIResponse} from "lib-core";
import { HttpClient } from "@angular/common/http";

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  templateUrl: './manage-books.component.html',
  styleUrl: './manage-books.component.css',
  providers:[ AlertService ]
})
export class ManageBooksComponent {

  title:string = 'Book summary' ;

  constructor( private http:HttpClient,
               @Host() private alertSvc:AlertService ) {}

  validateFile() {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const httpClient:HttpClient = this.http ;
    const alertSvc:AlertService = this.alertSvc ;

    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = false ;
    input.accept = '.yaml' ;
    input.addEventListener( 'change', function( e:Event ){

      const files:FileList|null = (e.target as HTMLInputElement).files ;
      const formData = new FormData() ;
      formData.append( 'file', files!.item(0) as File ) ;

      httpClient.post<APIResponse>( uploadUrl, formData )
          .subscribe( {
            next: res => {
              alertSvc.success( 'File successfully uploaded.' ) ;
              console.log( res )
            },
            error: err => {
              alertSvc.error( 'File upload failure' ) ;
            }
          } ) ;
    } ) ;
    input.click() ;
  }
}
