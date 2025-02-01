import { Component } from '@angular/core';
import {
  AlertsDisplayComponent,
  PageTitleComponent,
} from "lib-core";
import { RouterOutlet } from '@angular/router';

@Component( {
  selector: 'app-manage-problems',
  imports: [ RouterOutlet, PageTitleComponent, AlertsDisplayComponent ],
  template: `
    <page-title></page-title>
    <alerts-display></alerts-display>
    <div>
      <router-outlet></router-outlet>
    </div>
  `
})
export class ManageProblemsComponent {
}