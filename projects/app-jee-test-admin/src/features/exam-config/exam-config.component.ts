import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { PageTitleComponent } from "lib-core";

@Component({
  selector: 'exam-config',
  imports: [ RouterOutlet, PageTitleComponent ],
  template: `
    <page-title></page-title>
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class ExamConfigComponent {

}
