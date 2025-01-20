import { Component, SkipSelf } from '@angular/core';
import { ModalWaitService } from "./modal-wait.service";

@Component({
  selector: 'modal-wait',
  standalone: true,
  providers: [ ModalWaitService ],
  styles: `
      .modal-wait {
          width: 100vw;
          height: 100vh;
          position: absolute;
          z-index: 1000;
          background-color: rgba(10, 10, 10, 0.65);
          margin: 0 auto;
          text-align: center;
      }

      .helper {
          display: inline-block;
          height: 100%;
          vertical-align: middle;
      }
      
      .modal-wait img {
          vertical-align: middle;
          width: 100px;
          height: 100px;
      }
  `,
  template: `
    @if( modalWaitSvc.showWaitDialog ) {
      <div class="modal-wait">
        <span class="helper"></span>
        <img src="/core-assets/modal-wait.gif" 
             alt="Waiting ..."/>
      </div>
    }
  `
})
export class ModalWaitComponent {
  constructor( @SkipSelf() public modalWaitSvc:ModalWaitService ) {}
}
