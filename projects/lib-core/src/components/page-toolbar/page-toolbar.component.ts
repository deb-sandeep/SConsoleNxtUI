import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component( {
  selector: 'page-toolbar',
  imports: [ CommonModule ],
  template: `
    <div class="page-toolbar">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .page-toolbar {
        display: block;
        width: calc(100vw - var(--feature-menubar-width));
        height: var(--page-toolbar-height);
        background-color: var(--page-toolbar-bgcolor);
        color: var(--page-toolbar-fgcolor);
        font-size: 18px;
        padding-left: 10px;
    }
  `
})
export class PageToolbarComponent {
}
