import { Component, Host } from '@angular/core';
import { Alert, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent } from "lib-core";
import { environment } from "projects/environments/environment";
import { APIResponse} from "lib-core";
import { HttpClient } from "@angular/common/http";
import { RouterOutlet } from '@angular/router';

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [ RouterOutlet, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  providers:[ AlertService ],
  template:`
    <page-toolbar>
      <toolbar-action name='File upload'
                      icon="upload"
                      (click)="uploadFileBtnClicked()"></toolbar-action>
    </page-toolbar>
    <alerts-display></alerts-display>
    <div class="page-content">
      <router-outlet></router-outlet>
    </div>
  `
})
export class ManageBooksComponent {

  constructor( private http:HttpClient,
               @Host() private alertSvc:AlertService ) {}

  uploadFileBtnClicked() {

    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = false ;
    input.accept = '.yaml' ;
    input.addEventListener( 'change', (e:Event) => this.uploadFileSelected(e) ) ;
    input.click() ;
  }

  private uploadFileSelected( e:Event ) {

    const uploadUrl:string = `${environment.apiRoot}/Master/Book/ValidateMetaFile` ;
    const files:FileList|null = (e.target as HTMLInputElement).files ;

    const formData = new FormData() ;
    formData.append( 'file', files!.item(0) as File ) ;

    this.http.post<APIResponse>( uploadUrl, formData )
             .subscribe( {
                next: res => {
                  this.alertSvc.success( 'File successfully uploaded.' ) ;
                  console.log( res )
                },
                error: () => {
                  this.alertSvc.error( 'File upload failure' ) ;
                }
             } ) ;
  }
}
