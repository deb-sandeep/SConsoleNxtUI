import { Component, Host } from '@angular/core';
import { Alert, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent } from "lib-core";
import { HttpClient } from "@angular/common/http";
import { Router, RouterOutlet } from '@angular/router';
import { ManageBooksService } from "./manage-books.service";

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [ RouterOutlet, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  providers:[ AlertService, ManageBooksService ],
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
               @Host() private alertSvc:AlertService,
               @Host() private manageBookSvc:ManageBooksService,
               private router:Router ) {}

  uploadFileBtnClicked() {

    const input:HTMLInputElement = document.createElement('input') ;
    input.type = 'file';
    input.multiple = false ;
    input.accept = '.yaml' ;
    input.addEventListener( 'change', (e:Event) => this.uploadFileSelected(e) ) ;
    input.click() ;
  }

  private uploadFileSelected( e:Event ) {

    const files:FileList|null = (e.target as HTMLInputElement).files ;

    this.manageBookSvc.validateFileOnServer( files!.item(0) as File )
        .then( () => {
          this.alertSvc.success( 'File successfully validated.' ) ;
          this.router.navigateByUrl('/manage-books/upload-review')  ;
        } )
        .catch( ( msg ) => {
          this.alertSvc.error( 'File upload failure. ' + msg ) ;
        } ) ;
  }
}