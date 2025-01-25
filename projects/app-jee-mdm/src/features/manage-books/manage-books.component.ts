import {Component, inject} from '@angular/core';
import {
  Alert,
  ToolbarActionComponent,
  AlertsDisplayComponent,
  PageTitleComponent
} from "lib-core";
import { Router, RouterOutlet } from '@angular/router';
import { ManageBooksService } from "./manage-books.service";

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [ RouterOutlet, PageTitleComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  template:`
    <page-title>
      <toolbar-action name='File upload'
                      icon="upload"
                      (click)="uploadFileBtnClicked()"></toolbar-action>
    </page-title>
    <alerts-display></alerts-display>
    <div class="page-content">
      <router-outlet></router-outlet>
    </div>
  `
})
export class ManageBooksComponent {

  private alertSvc = inject( AlertService ) ;
  private manageBookSvc = inject( ManageBooksService ) ;
  private router = inject( Router ) ;

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
          this.router.navigateByUrl('/manage-books/upload-review').then()  ;
        } )
        .catch( ( msg ) => {
          this.alertSvc.error( 'File upload failure. ' + msg ) ;
        } ) ;
  }
}