import { Component, Host } from '@angular/core';
import { Alert, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent } from "lib-core";
import { environment } from "projects/environments/environment";
import { APIResponse} from "lib-core";
import { HttpClient } from "@angular/common/http";
import { Router, RouterOutlet } from '@angular/router';
import { ManageBookService } from "./services/manage-book.service";

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [ RouterOutlet, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  providers:[ AlertService, ManageBookService ],
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
               @Host() private manageBookSvc:ManageBookService,
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

    this.manageBookSvc.uploadFileForVerification( files!.item(0) as File )
        .then( () => {
          this.router.navigateByUrl( '/manage-books/upload-review' ) ;
        } )
        .catch( () => {
          this.alertSvc.error( 'File upload failure' ) ;
        } ) ;
  }
}
