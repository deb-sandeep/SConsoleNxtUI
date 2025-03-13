import { Component, inject, input } from '@angular/core';
import { StateService } from "../../../service/state.service";
import { WebSocketService } from "../../../service/web-socket.service";

@Component({
  selector: 'target-screen-btn',
  imports: [],
  templateUrl: './target-screen-btn.component.html',
  styleUrl: './target-screen-btn.component.css'
})
export class TargetScreenBtnComponent {

  stateSvc = inject( StateService ) ;
  remoteSvc = inject( WebSocketService ) ;

  bgColor = input<string>( '#515151' ) ;
  iconColor = input<string>( '#cdcdcd' ) ;
  iconName = input<string>( 'clock' ) ;
  labelColor = input<string>( '#bfbfbf' ) ;
  link = input<string>( '' ) ;

  targetScreenId = input.required<string>() ;

  requestTargetScreen() {
    if( this.link() !== '' ) {
      window.location.href = this.link() ;
    }
    else {
      this.remoteSvc.showScreen( this.targetScreenId() ) ;
    }
  }
}
