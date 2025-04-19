import { Component, input, model, output } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";

@Component({
  selector: 'modal-dialog',
  standalone: true,
  imports: [
    NgIf,
    NgClass
  ],
  templateUrl: './modal-dialog.component.html',
  styleUrl: './modal-dialog.component.css'
})
export class ModalDialogComponent {

  title = input.required<string>() ;
  width = input( 500 ) ; // In pixels
  height = input( 500 ) ; // In pixels
  show = input.required<boolean>() ;
  messages = model<string[]>([]) ;

  hide = output<boolean>() ;
  confirm = output<boolean>() ;

  getDialogContainerStyle() {
    return {
      top: `calc( 50dvh - ${this.height()}px/2)`,
      left: `calc( 50dvw - ${this.width()}px/2)`,
      height: `${this.height()}px`,
      width: `${this.width()}px`
    }
  }

  // Message container is placed below the dialog and is shown only if
  // there are messages, else remains hidden
  getMsgContainerStyle() {
    return {
      top: `calc( 50dvh + ${this.height()}px/2)`,
      left: `calc( 50dvw - ${this.width()}px/2)`,
      height: `150px`,
      width: `${this.width()}px`
    }
  }

  closeMessageDialog() {
    this.messages.set( [] ) ;
  }

  getMsgIconClass( msg:string) {
    if( msg.startsWith( 'ERROR' ) ) {
      return 'bi-exclamation-octagon' ;
    }
    else if( msg.startsWith( 'WARN' ) ) {
      return 'bi-exclamation-triangle' ;
    }
    return 'bi-info-circle' ;
  }

  getMsgClass( msg:string ) {
    if( msg.startsWith( 'ERROR' ) ) {
      return 'error-msg' ;
    }
    else if( msg.startsWith( 'WARN' ) ) {
      return 'warning-msg' ;
    }
    return 'info-msg' ;
  }
}
