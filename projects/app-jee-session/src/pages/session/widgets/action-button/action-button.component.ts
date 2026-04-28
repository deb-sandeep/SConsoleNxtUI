import { Component, input } from '@angular/core';

@Component({
  selector: 'action-btn',
  imports: [],
  template: `
    <div class="action-btn"
         [class.disabled]="disabled()"
         [class.busy]="busy()"
         [style.color]="color()"
         [style.background-color]="bgColor()">
      <div class="btn-txt">
        @if( busy() ) {
          <div class="action-btn-spinner"></div>
        } 
        @else {
          <ng-content></ng-content>
        }
      </div>
    </div>
  `,
  styleUrl: './action-button.component.css'
})
export class ActionButtonComponent {

  color = input<string>('#8f8f8f');
  bgColor = input<string>('#535353') ;
  disabled = input<boolean>(false) ;
  busy = input<boolean>(false) ;
}
