import { Component, input } from '@angular/core';

@Component({
  selector: 'action-btn',
  imports: [],
  template: `
    <div class="action-btn"
         [style.color]="color()"
         [style.background-color]="bgColor()">
      <div class="btn-txt">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './action-button.component.css'
})
export class ActionButtonComponent {

  color = input<string>('#8f8f8f');
  bgColor = input<string>('#535353') ;
}
