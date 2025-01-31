import { Component } from '@angular/core';
import {
  ToolbarActionComponent,
  AlertsDisplayComponent,
  PageTitleComponent,
  PageToolbarComponent
} from "lib-core";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-manage-problems',
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
export class ManageProblemsComponent {
}