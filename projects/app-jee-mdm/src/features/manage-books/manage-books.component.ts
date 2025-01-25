import {Component, inject} from '@angular/core';
import {
  Alert,
  ToolbarActionComponent,
  AlertsDisplayComponent,
  PageTitleComponent,
  PageToolbarComponent
} from "lib-core";
import { Router, RouterOutlet } from '@angular/router';
import { ManageBooksService } from "./manage-books.service";

import AlertService = Alert.AlertService;

@Component({
  selector: 'app-manage-books',
  standalone: true,
  imports: [ RouterOutlet, PageTitleComponent, PageToolbarComponent, ToolbarActionComponent, AlertsDisplayComponent ],
  template:`
    <page-title></page-title>
    <alerts-display></alerts-display>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class ManageBooksComponent {


}