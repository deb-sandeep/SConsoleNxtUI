import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component( {
  selector: 'closeable-badge',
  imports: [],
  template: `
    <div class="closeable-badge">
      {{ text }}
      <button type="button" class="btn-close btn-close close-btn"
              (click)="closeBtnClicked()"></button>
    </div>
  `,
  standalone: true,
  styles: `
      .closeable-badge {
          display: inline-block;
          background-color: #d3e0fd;
          padding: 1px 3px 1px 15px;
          margin: 0 3px 0 3px;
          color: #0736c0;
          font-weight: bold;
          border-radius: 10px;
      }

      .close-btn {
          width: 5px;
          height: 5px;
          padding: 2px 0 2px 25px;
          position: relative;
          vertical-align: middle;
      }
  `
})
export class CloseableBadgeComponent {

  @Input( "text" ) text:string = '' ;

  @Output( "close" )
  closeEventEmitter:EventEmitter<any> = new EventEmitter<void>() ;

  closeBtnClicked() {
    this.closeEventEmitter.emit() ;
  }
}
