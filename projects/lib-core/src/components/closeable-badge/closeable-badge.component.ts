import { Component, EventEmitter, Input, Output } from '@angular/core';
import { getContrastingTextColor } from '../../util/color-util' ;

@Component( {
  selector: 'closeable-badge',
  imports: [],
  template: `
    <div class="closeable-badge"
         [style.background-color]="color ?? null"
         [style.color]="textColor">
      {{ text }}
      <button type="button" class="btn-close btn-close close-btn"
              (click)="closeBtnClicked()"></button>
    </div>
  `,
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
  @Input( "color" ) color?:string ;

  @Output( "close" )
  closeEventEmitter:EventEmitter<any> = new EventEmitter<void>() ;

  get textColor():string | null {
    return this.color ? getContrastingTextColor( this.color ) : null ;
  }

  closeBtnClicked() {
    this.closeEventEmitter.emit() ;
  }
}
