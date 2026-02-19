import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-exam-setup',
  imports: [
    RouterOutlet
  ],
  template: `
    <div class="page-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .page-content {
      position: relative;
      width: 100%;
      min-height: calc(100dvh - var(--page-header-height) - var(--page-title-height));
    }
  `],
})
export class ExamSetupComponent {

}
